import React from 'react';
import { AppBar, IconButton } from '@material-ui/core';
import { useSelector } from 'react-redux';
import NavbarAvatar from '../NavbarAvatar';
import {
	StyledMenuIcon,
	StyledTitle,
	StyledToolbar,
	StyledDiv
} from './styled-components';
import NotificationsPopover from '../NotificationsPopover';
import { useHistory } from 'react-router-dom';

const Navbar = (props) => {
	const history = useHistory();
	const { authUser } = useSelector((state) => state.authState);

	return (
		<AppBar position='sticky'>
			<StyledToolbar authUser={authUser}>
				<StyledTitle variant='h4' onClick={() => history.push('/')}>
					VSP Intranet
				</StyledTitle>
				{authUser && (
					<IconButton
						edge='start'
						color='inherit'
						onClick={() => props.setDrawerOpen(true)}
					>
						<StyledMenuIcon />
					</IconButton>
				)}
				{authUser && (
					<StyledDiv>
						<NotificationsPopover />
						<NavbarAvatar authUser={authUser} />
					</StyledDiv>
				)}
			</StyledToolbar>
		</AppBar>
	);
};

export default Navbar;