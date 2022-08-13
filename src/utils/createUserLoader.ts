import DataLoader from "dataloader";
import { User } from "../entities/User";

// [1, 33, 6, 3]
// [{_id: 1, username: 'sss'}, {}, {}, {}]

export const createUserLoader = () =>
	new DataLoader<number, User>(async (userIds) => {
		const users = await User.findBy(userIds as any);
		const userIdToUser: Record<number, User> = {};
		users.forEach((u) => {
			userIdToUser[u._id] = u;
		});
		return userIds.map((userId) => userIdToUser[userId]);
	});
