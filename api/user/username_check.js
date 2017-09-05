import userServices from '../services/userServices';

export default async (req, res) => {
  if (req.user && req.user.success) {
    return res.json(req.user);
  }
  try {
    const ret = await userServices.username_check(req.body, req.context);
    ret.success = true;
    return res.json(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};
