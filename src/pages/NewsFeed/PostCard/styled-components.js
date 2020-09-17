import React from 'react';
import styled from 'styled-components';
import { CardHeader, CardContent, Button } from '@material-ui/core';
// eslint-disable-next-line no-unused-vars
export const StyledCardHeader = styled(({ skeleton, ...otherProps }) => (
	<CardHeader {...otherProps} />
))`
	padding-bottom: 0;
	& span.MuiCardHeader-title > span.MuiSkeleton-text {
		margin-bottom: ${(props) => props.skeleton && '10px'};
	}
`;

// eslint-disable-next-line no-unused-vars
export const StyledCardContent = styled(({ skeleton, ...otherProps }) => (
	<CardContent {...otherProps} />
))`
	padding: ${(props) => !props.skeleton && '0px 16px'};
`;

export const StyledCardActions = styled(CardContent)`
	padding-top: 0;
	display: flex;
	justify-content: space-between;
	padding: 0px 16px 16px 16px;
	& span.MuiTypography-root {
		font-size: 13px;
	}
`;

export const StyledButton = styled(Button)`
	text-transform: unset;
`;

// export const StyledButtonContainer = styled.div`
// 	display: flex;
// 	flex-direction: row;
// 	justify-content: flex-end;
// 	width: -webkit-fill-available;
// 	margin-top: 10px;
// 	& .MuiButton-root {
// 		margin-left: 10px;
// 	}
// `;

// export const StyledStepper = styled(Stepper)`
// 	background-color: inherit;
// `;