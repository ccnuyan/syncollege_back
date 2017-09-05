import userServices from '../services/userServices';

export default async (req, res) => {
  try {
    const ret = await userServices.register(req.body, req.context);
    if (ret.success) {
      req.user = ret;
    }
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};
