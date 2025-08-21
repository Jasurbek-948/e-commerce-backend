const Chat = require('../models/Chat');
const User = require('../models/User');
const Operator = require('../models/Operator');
const Cart = require('../models/Cart');

const onlineOperators = new Map(); // socket.id -> operatorId
const onlineUsers = new Map(); // socket.id -> userId

function setupChat(io) {
    io.on('connection', (socket) => {
        const socketId = socket.id;
        console.log(`Socket ulandi: ${socketId}`);

        socket.on('operatorJoin', async (operatorId) => {
            // Use operatorId from socket auth if not provided explicitly
            const effectiveOperatorId = operatorId || socket.operatorId;
            if (!effectiveOperatorId) {
                socket.emit('error', { message: 'Operator ID talab qilinadi' });
                return socket.disconnect();
            }

            try {
                const operator = await Operator.findById(effectiveOperatorId).select('fullName avatar isActive');
                if (!operator || !operator.isActive) {
                    socket.emit('error', { message: 'Operator topilmadi yoki faol emas' });
                    return socket.disconnect();
                }

                onlineOperators.set(socketId, effectiveOperatorId);
                socket.join(`operator_${effectiveOperatorId}`);
                io.emit('operatorStatus', { status: 'online', operatorId: effectiveOperatorId });
                console.log(`Operator ${effectiveOperatorId} onlayn bo'ldi`);

                const activeUsers = await Promise.all(
                    Array.from(onlineUsers.entries()).map(async ([sid, uid]) => {
                        const user = await User.findById(uid).select('fullName email avatar');
                        return {
                            userId: uid,
                            socketId: sid,
                            fullName: user?.fullName || 'Noma’lum',
                            avatar: user?.avatar || '',
                        };
                    })
                );
                socket.emit('activeUsers', { users: activeUsers });
            } catch (error) {
                console.error('Operator qo\'shilishda xatolik:', error);
                socket.emit('error', { message: 'Server xatosi' });
            }
        });

        socket.on('joinChat', async ({ userId }) => {
            if (!userId || userId !== socket.userId) {
                socket.emit('error', { message: 'Foydalanuvchi ID mos kelmaydi yoki talab qilinadi' });
                return socket.disconnect();
            }

            try {
                const user = await User.findById(userId).select('fullName email avatar isOnline lastActive');
                if (!user) {
                    socket.emit('error', { message: 'Foydalanuvchi topilmadi' });
                    return socket.disconnect();
                }

                socket.join(`user_${userId}`);
                onlineUsers.set(socketId, userId);
                user.isOnline = true;
                user.lastActive = new Date();
                await user.save();

                let chat = await Chat.findOne({ userId }).populate('messages.operatorId', 'fullName avatar');
                if (!chat) {
                    chat = new Chat({ userId, messages: [] });
                    await chat.save();
                }
                socket.emit('chatHistory', chat.messages);

                if (onlineOperators.size === 0) {
                    socket.emit('wait', { message: 'Operatorlar mavjud emas, kuting...' });
                    socket.emit('operatorStatus', { status: 'offline' });
                } else {
                    const operatorIds = Array.from(onlineOperators.values());
                    const operatorId = operatorIds[0];

                    const cart = await Cart.findOne({ user: userId }).populate({
                        path: 'items.product',
                        select: 'name price images description',
                    });

                    const userData = {
                        _id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        avatar: user.avatar,
                        cart: cart ? cart.items.map(item => ({
                            product: {
                                _id: item.product._id,
                                name: item.product.name,
                                price: item.product.price,
                                images: item.product.images,
                                description: item.product.description,
                            },
                            quantity: item.quantity,
                        })) : [],
                    };

                    io.to(`operator_${operatorId}`).emit('userConnected', { userId, user: userData });
                    socket.emit('operatorStatus', { status: 'online', operatorId });

                    const activeUsers = await Promise.all(
                        Array.from(onlineUsers.entries()).map(async ([sid, uid]) => {
                            const u = await User.findById(uid).select('fullName email avatar');
                            return {
                                userId: uid,
                                socketId: sid,
                                fullName: u?.fullName || 'Noma’lum',
                                avatar: u?.avatar || '',
                            };
                        })
                    );
                    operatorIds.forEach((opId) => io.to(`operator_${opId}`).emit('activeUsers', { users: activeUsers }));
                }
            } catch (error) {
                console.error('Foydalanuvchi chatga qo\'shilishda xatolik:', error);
                socket.emit('error', { message: 'Server xatosi' });
            }
        });

        socket.on('typing', ({ userId }) => {
            const operatorIds = Array.from(onlineOperators.values());
            if (operatorIds.length > 0) {
                io.to(`operator_${operatorIds[0]}`).emit('operatorTyping', { userId });
            }
        });

        socket.on('sendMessage', async ({ userId, message, fileUrl, messageType }) => {
            if (userId !== socket.userId) return;

            try {
                if (!message && !fileUrl) {
                    socket.emit('error', { message: 'Xabar yoki fayl bo\'lishi kerak' });
                    return;
                }

                if (onlineOperators.size === 0) {
                    socket.to(`user_${userId}`).emit('wait', { message: 'Operatorlar mavjud emas, kuting...' });
                    return;
                }

                const operatorIds = Array.from(onlineOperators.values());
                const operatorId = operatorIds[0];

                const newMessage = {
                    message: message ? message.trim() : '',
                    fileUrl,
                    messageType: messageType || 'text',
                    fromOperator: false,
                    operatorId: null,
                    timestamp: new Date(),
                };

                const chat = await Chat.findOneAndUpdate(
                    { userId },
                    { $push: { messages: newMessage }, $set: { updatedAt: new Date() } },
                    { new: true, upsert: true }
                ).populate('messages.operatorId', 'fullName avatar');

                const savedMessage = chat.messages[chat.messages.length - 1];
                io.to(`user_${userId}`).emit('message', savedMessage);
                io.to(`operator_${operatorId}`).emit('message', savedMessage);
                console.log(`Xabar yuborildi: ${userId} -> ${operatorId}`);
            } catch (error) {
                console.error('Xabar yuborishda xatolik:', error);
                socket.emit('error', { message: 'Xabar yuborishda xatolik yuz berdi' });
            }
        });

        socket.on('operatorReply', async ({ userId, operatorId, message, fileUrl, messageType }) => {
            if (operatorId !== socket.operatorId) return;

            try {
                if (!message && !fileUrl) {
                    socket.emit('error', { message: 'Xabar yoki fayl bo\'lishi kerak' });
                    return;
                }

                const newMessage = {
                    message: message ? message.trim() : '',
                    fileUrl,
                    messageType: messageType || 'text',
                    fromOperator: true,
                    operatorId,
                    timestamp: new Date(),
                };

                const chat = await Chat.findOneAndUpdate(
                    { userId },
                    { $push: { messages: newMessage }, $set: { updatedAt: new Date() } },
                    { new: true, upsert: true }
                ).populate('messages.operatorId', 'fullName avatar');

                const savedMessage = chat.messages[chat.messages.length - 1];
                io.to(`user_${userId}`).emit('message', savedMessage);
                io.to(`operator_${operatorId}`).emit('message', savedMessage);
                console.log(`Operator javob yubordi: ${operatorId} -> ${userId}`);
            } catch (error) {
                console.error('Operator javobida xatolik:', error);
                socket.emit('error', { message: 'Operator javobida xatolik yuz berdi' });
            }
        });

        socket.on('disconnect', async () => {
            try {
                console.log(`Socket uzildi: ${socketId}`);
                if (onlineOperators.has(socketId)) {
                    const operatorId = onlineOperators.get(socketId);
                    onlineOperators.delete(socketId);
                    io.emit('operatorStatus', { status: onlineOperators.size > 0 ? 'online' : 'offline', operatorId });
                    console.log(`Operator ${operatorId} oflayn bo'ldi`);
                } else if (onlineUsers.has(socketId)) {
                    const userId = onlineUsers.get(socketId);
                    const user = await User.findById(userId);
                    if (user) {
                        user.isOnline = false;
                        user.lastActive = new Date();
                        await user.save();
                    }
                    onlineUsers.delete(socketId);
                    console.log(`Foydalanuvchi ${userId} oflayn bo'ldi`);
                }

                const activeUsers = await Promise.all(
                    Array.from(onlineUsers.entries()).map(async ([sid, uid]) => {
                        const user = await User.findById(uid).select('fullName email avatar');
                        return {
                            userId: uid,
                            socketId: sid,
                            fullName: user?.fullName || 'Noma’lum',
                            avatar: user?.avatar || '',
                        };
                    })
                );
                const operatorIds = Array.from(onlineOperators.values());
                operatorIds.forEach((opId) => io.to(`operator_${opId}`).emit('activeUsers', { users: activeUsers }));
            } catch (error) {
                console.error('Ulanish uzilishida xatolik:', error);
            }
        });
    });
}

module.exports = { setupChat };