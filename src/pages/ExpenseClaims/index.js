import { CircularProgress, Container, Grid } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import CollectionData from '../../models/collection-data';
import { READ_PAGE, READ_EXPENSE_CLAIM } from '../../utils/actions';
// import ProductRequestCard from './ProductRequestCard';
import AddIcon from '@material-ui/icons/Add';
import FloatingActionButton from '../../components/FloatingActionButton';
import ExpenseClaim from '../../models/expense-claim';
import ExpenseClaimCard from './ExpenseClaimCard';
import NewExpenseClaimDialog from './NewExpenseClaimDialog';
// import NewProductRequestDialog from './NewProductRequestDialog';

const ExpenseClaims = (props) => {
	const dispatch = useDispatch();
	const { authUser } = useSelector((state) => state.authState);
	const { userId } = authUser;

	const params = useParams();
	const { action } = props;
	const { replace, push } = useHistory();

	const initialPage = 1;
	const MAX_PER_PAGE = 5;

	const [collectionData, setCollectionData] = useState();
	const [dataSource, setDataSource] = useState();

	const [page, setPage] = useState(initialPage);
	const [expenseClaimIds, setExpenseClaimIds] = useState();
	const [activeExpenseClaimId, setActiveExpenseClaimId] = useState(null);

	const [isAdmin, setIsAdmin] = useState();
	const [showNewExpenseClaimDialog, setShowNewExpenseClaimDialog] = useState(
		false
	);
	//Mount and dismount, get admin status
	useEffect(() => {
		const asyncFunction = async () => {
			const newIsAdmin = await ExpenseClaim.isAdmin();
			setIsAdmin(newIsAdmin);
		};
		asyncFunction();
	}, []);
	//Get expense claims based on user
	useEffect(() => {
		let collectionDataListener;
		const asyncFunction = async () => {
			let listenerRef;
			if (isAdmin) {
				//Get all documents
				listenerRef = CollectionData.getListener('expense-claims');
			} else {
				//Get only documents where the user has ownership
				listenerRef = CollectionData.getNestedListener({
					document: 'expense-claims',
					subCollection: 'users',
					subCollectionDoc: 'GQOQYkuXGOewtkBOXjguSn85ZgJ2'
				});
			}
			collectionDataListener = listenerRef.onSnapshot((snapshot) => {
				let newCollectionData = new CollectionData({
					collection: 'expense-claims',
					documents: []
				});
				if (snapshot.exists) {
					newCollectionData = new CollectionData({
						...snapshot.data(),
						collection: snapshot.id
					});
				}
				setCollectionData(newCollectionData);
			});
		};
		if (isAdmin !== undefined) {
			asyncFunction();
		}
		return () => {
			if (collectionDataListener) {
				collectionDataListener();
			}
		};
	}, [dispatch, isAdmin, userId]);
	//If results change or collectionData changes, update the data source
	useEffect(() => {
		if (collectionData) {
			let newDataSource = [...collectionData.documents].reverse();
			setDataSource(newDataSource);
		}
	}, [collectionData]);
	//When a new change in the data source is detected
	useEffect(() => {
		if (dataSource) {
			let newPage = initialPage;
			if (action === READ_PAGE) {
				//Common case
				const pageNumber = parseInt(params.page);
				const lastPage = Math.ceil(dataSource.length / MAX_PER_PAGE);
				//lastPage === 0, means there are no records
				if ((pageNumber > 0 && pageNumber <= lastPage) || lastPage === 0) {
					newPage = pageNumber;
				} else {
					newPage = initialPage;
					replace(`/expense-claims/page/${initialPage}`);
				}
			} else if (action === READ_EXPENSE_CLAIM) {
				//Coming from direct link
				const expenseClaimId = params.expenseClaimId;
				const index = dataSource.findIndex(
					(document) => document === expenseClaimId
				);
				if (index !== -1) {
					newPage = Math.floor(index / MAX_PER_PAGE) + 1;
					const newExpenseClaimId = expenseClaimId;
					setActiveExpenseClaimId(newExpenseClaimId);
				} else {
					newPage = initialPage;
					replace(`/expense-claims/page/${initialPage}`);
				}
			}
			//Slicing the data source to only include 5 results
			const START_INDEX = newPage * MAX_PER_PAGE - MAX_PER_PAGE;
			const END_INDEX = START_INDEX + MAX_PER_PAGE;
			const newExpenseClaimIds = dataSource.slice(START_INDEX, END_INDEX);
			setPage(newPage);
			setExpenseClaimIds(newExpenseClaimIds);
		}
	}, [dataSource, action, params, replace]);

	if (!expenseClaimIds) {
		return <CircularProgress />;
	}

	const count = Math.ceil(dataSource.length / MAX_PER_PAGE);

	return (
		<Fragment>
			<NewExpenseClaimDialog
				open={showNewExpenseClaimDialog}
				close={() => setShowNewExpenseClaimDialog(false)}
			/>
			<Container disableGutters maxWidth='sm'>
				<Grid container direction='column' spacing={2}>
					<Grid item container direction='column' spacing={2}>
						{expenseClaimIds.map((expenseClaimId) => {
							const scroll = activeExpenseClaimId === expenseClaimId;
							return (
								<Grid item key={expenseClaimId}>
									<ExpenseClaimCard
										expenseClaimId={expenseClaimId}
										setActiveExpenseClaimId={setActiveExpenseClaimId}
										scroll={scroll}
										isAdmin={isAdmin}
									/>
								</Grid>
							);
						})}
						{dataSource.length > 0 && (
							<Grid item container direction='row' justify='center'>
								<Pagination
									color='primary'
									count={count}
									page={page}
									onChange={(_event, value) =>
										push(`/expense-claims/page/${value.toString()}`)
									}
									showFirstButton={true}
									showLastButton={true}
								/>
							</Grid>
						)}
					</Grid>
				</Grid>
			</Container>
			<FloatingActionButton
				color='primary'
				tooltip='Add Expense Claim'
				onClick={() => setShowNewExpenseClaimDialog(true)}
			>
				<AddIcon />
			</FloatingActionButton>
		</Fragment>
	);
};

export default ExpenseClaims;
