import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Step, StepLabel } from '@material-ui/core';
import firebase from '../../utils/firebase';
import EmailForm from './EmailForm';
import CodeForm from './CodeForm';
import {
	StyledChildContainer,
	StyledCard,
	StyledStepper
} from './styled-components';
import * as authController from '../../controllers/auth';
import { useDispatch } from 'react-redux';

const Login = (props) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [passwordMode, setPasswordMode] = useState(false);
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [confirmationResult, setConfirmationResult] = useState();
	const [activeStep, setActiveStep] = useState(0);
	const stepLabels = ['Enter email', 'Enter SMS code', 'Sign in'];
	const captchaRef = useRef();
	//Initialize the recaptcha div
	useEffect(() => {
		window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
			captchaRef.current,
			{
				size: 'invisible',
				callback: (_repsonse) => null
			}
		);
	}, []);
	//Reset values upon mounting component
	useEffect(() => {
		if (activeStep === 0) {
			setEmail('');
		} else if (activeStep === 1) {
			setVerificationCode('');
			setPassword('');
		}
	}, [activeStep]);
	//Side effect of email value confirmed
	useEffect(() => {
		const asyncFunction = async () => {
			setLoading(true);
			if (email.startsWith('*')) {
				setPasswordMode(true);
				setActiveStep(1);
				setLoading(false);
			} else {
				const phoneNumber = await dispatch(
					authController.getPhoneNumber(email)
				);
				if (phoneNumber) {
					const appVerifier = window.recaptchaVerifier;
					const newConfirmationResult = await dispatch(
						authController.signInWithPhoneNumber(phoneNumber, appVerifier)
					);
					if (newConfirmationResult) {
						setConfirmationResult(newConfirmationResult);
						setActiveStep(1);
					}
				}
				setEmail('');
				setLoading(false);
			}
		};
		if (email) {
			asyncFunction();
		}
	}, [email, dispatch]);
	//Side effect of verification code confirmed
	useEffect(() => {
		const asyncFunction = async () => {
			setLoading(true);
			setActiveStep(2);
			const result = await dispatch(
				authController.confirmVerificationCode(
					confirmationResult,
					verificationCode
				)
			);
			if (!result) {
				setActiveStep(1);
				setLoading(false);
			}
		};
		if (confirmationResult && verificationCode) {
			asyncFunction();
		}
	}, [confirmationResult, verificationCode, dispatch]);
	//Side effect of password entered
	useEffect(() => {
		const asyncFunction = async () => {
			setLoading(true);
			setActiveStep(2);
			const newEmail = email.split('*').pop();
			const result = await dispatch(
				authController.loginWithPassword(newEmail, password)
			);
			if (!result) {
				setActiveStep(1);
				setLoading(false);
			}
		};
		if (email && password) {
			asyncFunction();
		}
	}, [password, email, dispatch]);

	return (
		<Fragment>
			<div ref={captchaRef} />
			<StyledChildContainer>
				<StyledCard raised={true}>
					{activeStep === 0 ? (
						<EmailForm loading={loading} setEmail={setEmail} />
					) : (
						<CodeForm
							loading={loading}
							setActiveStep={setActiveStep}
							setVerificationCode={setVerificationCode}
							passwordMode={passwordMode}
							setPassword={setPassword}
						/>
					)}
				</StyledCard>
			</StyledChildContainer>
			<StyledChildContainer>
				<StyledStepper activeStep={activeStep} alternativeLabel={true}>
					{stepLabels.map((label, index) => (
						<Step key={index}>
							<StepLabel>{label}</StepLabel>
						</Step>
					))}
				</StyledStepper>
			</StyledChildContainer>
		</Fragment>
	);
};
export default Login;