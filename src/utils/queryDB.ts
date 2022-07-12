import mongoose from 'mongoose';

export const QUERY_GET_ALL_MSG_FROM_ALL_PRIVATE_ROOMS_BY_USER_ID = (userId: string): any => {
  return [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'private_chat_rooms',
        localField: 'privateChatRooms',
        foreignField: '_id',
        as: 'detailRooms',
      },
    },
    {
      $project: {
        _id: 1,
        detailRooms: {
          $filter: {
            input: '$detailRooms',
            as: 'room',
            cond: { $ne: ['$$room.messages', []] },
          },
        },
      },
    },
    {
      $unwind: {
        path: '$detailRooms',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: 'chat_messages',
        let: {
          local_ids: '$detailRooms.messages',
          user_id: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$_id', '$$local_ids'],
              },
            },
          },
          {
            $sort: {
              created_at: -1,
            },
          },
          {
            $limit: 20,
          },
        ],
        as: 'detailRooms.messages',
      },
    },
    {
      $unwind: {
        path: '$detailRooms.messages',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: '$detailRooms._id',
        roomName: {
          $first: '$detailRooms.name',
        },
        messages: {
          $push: {
            _id: '$detailRooms.messages._id',
            content: '$detailRooms.messages.content',
            senderId: '$detailRooms.messages.senderId',
            created_at: '$detailRooms.messages.created_at',
            readBy: '$detailRooms.messages.readBy',
          },
        },
        countNotification: {
          $sum: {
            $cond: [{ $in: ['$_id', '$detailRooms.messages.readBy'] }, 0, 1],
          },
        },
      },
    },
  ];
};
