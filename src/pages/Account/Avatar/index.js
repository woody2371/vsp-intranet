import React, { Fragment, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Menu, MenuItem, CircularProgress } from '@material-ui/core';
import * as userController from '../../../controllers/user';
import { StyledAvatar } from '../styled-components';
import { withRouter } from 'react-router-dom';
import ConfirmDialog from '../../../components/ConfirmDialog';

const Avatar = withRouter((props) => {
	const authUser = props.authUser;
	const fileInputRef = useRef();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [anchorElement, setAnchorElement] = useState(null);

	const menuCloseHandler = () => {
		setAnchorElement(null);
	};

	const removeClickHandler = () => {
		setShowConfirmDialog(true);
		menuCloseHandler();
	};

	const uploadClickHandler = () => {
		fileInputRef.current.click();
		menuCloseHandler();
	};

	const cancelClickHandler = () => {
		setShowConfirmDialog(false);
	};

	const confirmClickHandler = async () => {
		setLoading(true);
		await dispatch(userController.removePicture());
		setLoading(false);
		setShowConfirmDialog(false);
	};

	const fileSelectedHandler = async (event) => {
		setLoading(true);
		const files = [...event.target.files];
		if (files.length === 1) {
			await dispatch(userController.uploadPicture(files[0]));
		}
		setLoading(false);
		fileInputRef.current.value = null;
	};

	const firstName = authUser.firstName.substring(0, 1);
	const lastName = authUser.lastName.substring(0, 1);

	return (
		<Fragment>
			<ConfirmDialog
				open={showConfirmDialog}
				cancel={cancelClickHandler}
				confirm={confirmClickHandler}
				title='Profile Picture'
				message='Are you sure you want to remove your profile picture?'
			/>
			<StyledAvatar
				size={3}
				darkMode={authUser.settings.darkMode}
				onClick={(event) => setAnchorElement(event.target)}
				src={authUser.profilePicture}
			>
				{loading ? <CircularProgress /> : `${firstName}${lastName}`}
			</StyledAvatar>
			<input
				type='file'
				accept='image/*'
				hidden
				ref={fileInputRef}
				onChange={fileSelectedHandler}
			/>

			<Menu
				id='simple-menu'
				anchorEl={anchorElement}
				keepMounted
				open={!!anchorElement}
				onClose={menuCloseHandler}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				getContentAnchorEl={null}
			>
				<MenuItem onClick={uploadClickHandler}>Upload Picture</MenuItem>
				<MenuItem onClick={removeClickHandler}>Remove Picture</MenuItem>
			</Menu>
		</Fragment>
	);
});

export default Avatar;
