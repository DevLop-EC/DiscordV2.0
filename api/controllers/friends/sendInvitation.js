import FriendInvitation from '../../models/friendInvitation.js';
import User from '../../models/user.js';

const sendInvitation = async (req, res) => {
	const {targetMailAddress} = req.body;

	const {userId, email} = req.user;

	console.log(req.body);
	console.log(req.user);

	// check if friend that we would like to invite is not user

	if (
		email.toLowerCase() === targetMailAddress.toLowerCase()
	) {
		return res
			.status(409)
			.send(
				'Sorry. You cannot become friend with yourself'
			);
	}

	const targetUser = await User.findOne({
		email: targetMailAddress.toLowerCase(),
	});

	console.log('targetUser', targetUser);

	if (!targetUser) {
		return res
			.status(404)
			.send(
				`Friend of ${targetMailAddress} has not been found. Please check mail address.`
			);
	}

	// check if invitation has been already sent
	const invitationAlreadyReceived =
		await FriendInvitation.findOne({
			senderId: userId,
			receiverId: targetUser._id,
		});

	console.log(
		'invitationAlreadyReceived',
		invitationAlreadyReceived
	);

	if (invitationAlreadyReceived) {
		return res
			.status(409)
			.send('Invitation has been already sent');
	}

	// check if the user whuch we would like to invite is already our friend
	const usersAlreadyFriends = targetUser.friends.find(
		(friendId) => friendId.toString() === userId.toString()
	);

	console.log('usersAlreadyFriends', usersAlreadyFriends);

	if (usersAlreadyFriends) {
		return res
			.status(409)
			.send(
				'Friend already added. Please check friends list'
			);
	}

	// create new invitation in database
	const newInvitation = await FriendInvitation.create({
		senderId: userId,
		receiverId: targetUser._id,
	});

	// if invtiation has been successfully created we would like to update friends invitations if other user is online

	// send pending invitations update to specific user
	// friendsUpdates.updateFriendsPendingInvitations(
	// 	targetUser._id.toString()
	// );

	return res.status(201).send('Invitation has been sent');
};

export default sendInvitation;
