import userServices from '../services/userServices';

export default async (req, res) => {
  if (req.user && req.user.success) {
    return res.json(req.user);
  }
  try {
    const ret = await userServices.get_oauth_user(req.body, req.context);
    return res.json(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};
