import React, { useEffect, useState, useRef } from 'react';
import {
	Collapse,
	Typography,
	IconButton,
	Button,
	CardHeader,
	CardContent,
	CardActions,
	withTheme,
	Grid
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import LeaveRequest from '../../../models/leave-request';
import {
	Comment as CommentIcon,
	MoreVert as MoreVertIcon
} from '@material-ui/icons';
import Comments from '../../../components/Comments';
import { Skeleton } from '@material-ui/lab';
import Avatar from '../../../components/Avatar';
import scrollToComponent from 'react-scroll-to-component';
import Card from '../../../components/Card';
import { LONG_DATE_TIME } from '../../../utils/date';
import LeaveRequestForm from './LeaveRequestFom';
import ActionButtons from './ActionButtons';
import { addComment } from '../../../store/actions/leave-request';

const LeaveRequestCard = withTheme((props) => {
	const dispatch = useDispatch();
	const scrollRef = useRef();
	const { authUser } = useSelector((state) => state.authState);
	const { users } = useSelector((state) => state.dataState);
	const { leaveRequestId, scroll, setActiveLeaveRequestId } = props;
	const [leaveRequest, setLeaveRequest] = useState();
	const [showComments, setShowComments] = useState(false);

	useEffect(() => {
		if (scroll && leaveRequest) {
			scrollToComponent(scrollRef.current, {
				ease: 'linear',
				align: 'top',
				offset: -90,
				duration: 500
			});
			setActiveLeaveRequestId(null);
		}
	}, [scroll, setActiveLeaveRequestId, leaveRequest]);

	useEffect(() => {
		let leaveRequestListener;
		const asyncFunction = async () => {
			leaveRequestListener = LeaveRequest.getListener(
				leaveRequestId
			).onSnapshot((doc) => {
				const metadata = {
					...doc.data().metadata,
					createdAt: doc.data().metadata.createdAt.toDate(),
					updatedAt: doc.data().metadata.updatedAt.toDate()
				};
				const actions = doc.data().actions.map((action) => ({
					...action,
					actionedAt: action.actionedAt.toDate()
				}));
				const start = doc.data().start.toDate();
				const end = doc.data().end.toDate();
				const newLeaveRequest = new LeaveRequest({
					...doc.data(),
					leaveRequestId: doc.id,
					actions: actions,
					metadata: metadata,
					start: start,
					end: end
				});
				setLeaveRequest(newLeaveRequest);
			});
		};
		asyncFunction();
		return () => {
			leaveRequestListener();
		};
	}, [leaveRequestId, users]);

	if (!leaveRequest) {
		return (
			<Card elevation={2}>
				<CardHeader
					avatar={
						<Skeleton animation='pulse' variant='circle'>
							<Avatar user={authUser} />
						</Skeleton>
					}
					title={<Skeleton animation='pulse' height={20} width='60%' />}
					subheader={<Skeleton animation='pulse' height={20} width='40%' />}
					action={
						<IconButton disabled={true}>
							<MoreVertIcon />
						</IconButton>
					}
				/>
				<CardContent>
					<Skeleton animation='pulse' variant='rect' height={200} />
				</CardContent>
				<CardActions style={{ padding: `${props.theme.spacing(2)}px` }}>
					<Skeleton animation='pulse' height={20} width='20%' />
					<Skeleton animation='pulse' height={30} width='10%' />
				</CardActions>
			</Card>
		);
	}

	const newCommentHandler = async (body, attachments) => {
		const result = await dispatch(addComment(leaveRequest, body, attachments));
		return result;
	};

	const commentsClickHandler = () => {
		setShowComments((prevState) => !prevState);
	};
	const commentsCount = leaveRequest.comments.length;
	let commentButtonText = 'Comment';
	if (commentsCount > 0) {
		commentButtonText = `${commentsCount} Comment`;
		if (commentsCount > 1) {
			commentButtonText = `${commentButtonText}s`;
		}
	}

	const user = users.find((user) => user.userId === leaveRequest.user);
	const postDate = leaveRequest.metadata.createdAt;

	return (
		<div ref={scrollRef}>
			<Card elevation={2}>
				<CardHeader
					avatar={<Avatar user={user} clickable={true} contactCard={true} />}
					title={leaveRequest.type}
					titleTypographyProps={{
						variant: 'body1'
					}}
					subheader={`${user.firstName} ${user.lastName}`}
				/>
				<CardContent>
					<LeaveRequestForm leaveRequest={leaveRequest} />
				</CardContent>
				<CardActions style={{ padding: `${props.theme.spacing(2)}px` }}>
					<Grid container direction='column' spacing={1}>
						<Grid item container direction='row' justify='flex-end' spacing={1}>
							<ActionButtons
								leaveRequest={leaveRequest}
								user={user}
								isManager={authUser.userId === leaveRequest.manager}
							/>
						</Grid>
						<Grid item container direction='row' justify='space-between'>
							<Grid item>
								<Typography color='secondary' component='span' variant='body2'>
									{format(postDate, LONG_DATE_TIME)}
								</Typography>
							</Grid>
							<Grid item>
								<Button
									style={{ textTransform: 'unset' }}
									size='small'
									color='secondary'
									onClick={commentsClickHandler}
									startIcon={
										leaveRequest.comments.length === 0 && <CommentIcon />
									}
								>
									{commentButtonText}
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</CardActions>
				<Collapse in={showComments} timeout='auto'>
					<Comments
						authUser={authUser}
						submitHandler={newCommentHandler}
						comments={[...leaveRequest.comments].reverse()}
						enableNotifyUsers={false}
					/>
				</Collapse>
			</Card>
		</div>
	);
});

export default LeaveRequestCard;
