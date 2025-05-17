const userController = require("../controllers/User");

//Get all the Registered User
const GetAllUser = async (req, res) => {
  const result = await userController.getAll();
  if (!result.success) return res.status(404).send(result);
  res.send(result);
};

//Login an User
const Login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Verifying User in the Database.
  const result = await userController.getUser(email, password);
  if (!result.success) return res.status(404).send(result.message);

  //extract the token Generated and send it in Header.
  const { token, ...userData } = result;
  res.header("x-auth-token", token).send(userData);
};

//Register an new User
const Register = async (req, res) => {
  const { countryCode, ...user } = req.body;

  //Verifying User in the Database.
  const result = await userController.createUser(user, countryCode);
  if (!result.success)
    return res
      .status(result.code | 500)
      .send({ message: result.message, data: req.body });

  //extract the token Generated and send it in Header.
  const { token, ...userData } = result;
  return res.header("x-auth-token", token).send(userData);
};

module.exports = { GetAllUser, Login, Register };
