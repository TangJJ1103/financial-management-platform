const url = "http://localhost:5041/";

const apiEndPoints = {
  login: "auth/validateUser",
  getUserById: "userData/getUser/",
  updateUser: "userData/updateUser",
  register: "auth/createUser",
  getCurrencyList: "currency/getAllType",
  convertCurrency: "currency/convert",

  getUserExpenses: "userFinance/getUserExpenses/",
  addUserExpenses: "userFinance/addUserExpense",
  deleteUserExpenses: "userFinance/deleteUserExpense/",

  addFamilyExpense: "familyFinance/addFamilyExpense",
  getFamilyExpenses: "familyFinance/getFamilyExpenses/",
  deleteFamilyExpense: "familyFinance/deleteFamilyExpense/",

  getUserBudgets: "userFinance/getUserBudgets/",
  addUserBudget: "userFinance/addUserBudget",
  updateUserBudget: "userFinance/updateUserBudget",
  deleteUserBudget: "userFinance/deleteUserBudget/",

  getFamilyBudgets: "familyFinance/getFamilyBudgets/",
  addFamilyBudget: "familyFinance/addFamilyBudget",
  updateFamilyBudget: "familyFinance/updateFamilyBudget",
  deleteFamilyBudget: "familyFinance/deleteFamilyBudget/",

  getUserGoals: "userFinance/getUserGoals/",
  addUserGoal: "userFinance/addUserGoal",
  updateUserGoal: "userFinance/updateUserGoal",
  deleteUserGoal: "userFinance/deleteUserGoal/",

  getFamilyGoals: "familyFinance/getFamilyGoals/",
  addFamilyGoal: "familyFinance/addFamilyGoal",
  updateFamilyGoal: "familyFinance/updateFamilyGoal",
  deleteFamilyGoal: "familyFinance/deleteFamilyGoal/",

  addUserGoalTransaction: "userFinance/addUserGoalTransaction",
  getUserGoalTransactions: "userFinance/getUserGoalTransactions/",

  addFamilyGoalTransaction: "familyFinance/addFamilyGoalTransaction",
  getFamilyGoalTransactions: "familyFinance/getFamilyGoalTransactions/",

  checkUserFamilyStatus: "familyData/checkUserFamilyStatus/",
  createFamily: "familyData/createFamily",
  searchFamilies: "familyData/searchFamily",
  joinFamily: "familyData/joinFamily",
  getFamilyMembers: "familyData/getFamilyMembers/",
  inviteToFamily: "familyData/inviteMember",
  removeFamilyMember: "familyData/removeFamilyMember/",
  getFamilyInvitations: "familyData/getFamilyInvitations/",
  respondToInvitation: "familyData/respondInvitation",
  getJoinRequests: "familyData/getJoinRequests/",
  respondToJoinRequest: "familyData/respondJoinRequest",
  updateFamilyRole: "familyData/updateFamilyRole",

  uploadImage: "s3/uploadImage",
};

const getApiEndpoint = (type) => {
  return `${url}${apiEndPoints[type]}` || null;
};

export default getApiEndpoint;
export const API_BASE_URL = "http://localhost:5041";
