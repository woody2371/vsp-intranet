import React, { useState } from 'react';
import { Grid, Tooltip, IconButton, Badge, Button } from '@material-ui/core';
import ProgressWithLabel from '../ProgressWithLabel';
import { useSelector } from 'react-redux';
import {
	Attachment as AttachmentIcon,
	People as PeopleIcon
} from '@material-ui/icons';
import NotifyUsersList from '../NotifyUsersList';
import AttachmentsDropzone from '../AttachmentsDropZone';
import { StyledButtonProgress } from './styled-components';

const ActionsBar = (props) => {
	const uploadState = useSelector((state) => state.uploadState);
	const [notifyUsersOpen, setNotifyUsersOpen] = useState(false);
	const [dropzoneOpen, setDropzoneOpen] = useState(false);
	const {
		notifications,
		attachments,
		buttonLoading,
		loading,
		isValid,
		onClick,
		tooltipPlacement,
		actionButtonText,
		additionalButtons
	} = props;
	return (
		<Grid container direction='column'>
			{uploadState.filesProgress && (
				<Grid item>
					<ProgressWithLabel
						transferred={uploadState.filesProgress.reduce(
							(total, value) => (total += value.bytesTransferred),
							0
						)}
						total={uploadState.filesProgress.reduce(
							(total, value) => (total += value.totalBytes),
							0
						)}
					/>
				</Grid>
			)}
			<Grid item container direction='row' wrap='nowrap' spacing={1}>
				<Grid
					item
					container
					direction='row'
					justify='flex-end'
					alignItems='center'
				>
					{notifications.enabled && (
						<Grid item>
							<Tooltip title='Notify staff' placement={tooltipPlacement}>
								<IconButton
									disabled={loading}
									onClick={setNotifyUsersOpen.bind(this, true)}
								>
									<Badge
										badgeContent={notifications.notifyUsers.length}
										color='secondary'
									>
										<PeopleIcon />
									</Badge>
								</IconButton>
							</Tooltip>
							<NotifyUsersList
								setNotifyUsersOpen={setNotifyUsersOpen}
								notifyUsersOpen={notifyUsersOpen}
								setNotifyUsers={notifications.setNotifyUsers}
								notifyUsers={notifications.notifyUsers}
							/>
						</Grid>
					)}
					{attachments.enabled && (
						<Grid item>
							<Tooltip title='Attachments' placement={tooltipPlacement}>
								<IconButton
									onClick={setDropzoneOpen.bind(this, true)}
									disabled={loading}
								>
									<Badge
										badgeContent={attachments.attachments.length}
										color='secondary'
									>
										<AttachmentIcon />
									</Badge>
								</IconButton>
							</Tooltip>
							<AttachmentsDropzone
								dropzoneOpen={dropzoneOpen}
								setDropzoneOpen={setDropzoneOpen}
								attachments={attachments.attachments}
								setAttachments={attachments.setAttachments}
							/>
						</Grid>
					)}
				</Grid>
				<Grid
					item
					container
					direction='row'
					justify='flex-end'
					alignItems='center'
					wrap='nowrap'
					spacing={1}
					style={{ flex: 1 }}
				>
					{additionalButtons &&
						additionalButtons.map((additionalButton) => (
							<Grid
								key={additionalButton.buttonText}
								item
								container
								justify='center'
								alignItems='center'
								style={{ position: 'relative' }}
							>
								<Button
									variant='outlined'
									color='primary'
									onClick={additionalButton.onClick}
									disabled={!isValid || loading}
								>
									{additionalButton.buttonText}
								</Button>
								{additionalButton.buttonLoading && (
									<StyledButtonProgress size={25} />
								)}
							</Grid>
						))}
					<Grid
						item
						container
						justify='center'
						alignItems='center'
						style={{ position: 'relative' }}
					>
						<Button
							variant='outlined'
							color='primary'
							onClick={onClick}
							disabled={!isValid || loading}
						>
							{actionButtonText}
						</Button>
						{buttonLoading && <StyledButtonProgress size={25} />}
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default ActionsBar;
