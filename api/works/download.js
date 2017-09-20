import { JSDOM } from 'jsdom';
import fs from 'fs';
// import fetch from 'fetch';
import request from 'request';
import workServices from '../services/workServices';
import config from '../../config';

const rawHTML =
  `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>__TITLE__ from http://www.syncollge.com</title>
    <style>
      __STYLESHEET__
    </style>
  </head>
  <body>
    <div class="reveal">
        __REVEAL__
    </div>
    <script type="text/javascript">
      __SCRIPTS__
    </script>
    <script type="text/javascript">
      window.Reveal.initialize();
    </script>
  </body>
</html>`;

const exportRequiredStylesheets = {
  normalize: 'normalize.min.css',
  reveal: 'reveal.min.css',
  reveal_theme: 'white.css',
  reveal_override: 'reveal_override.css',
};

const exportRequiredScripts = {
  head: 'head.min.js',
  html5shiv: 'html5shiv.min.js',
  reveal: 'reveal.min.js',
};

export default async (req, res) => {
  const work = await workServices.require_work({
    work_id: req.query.work_id,
  }, req.context);

  if (!work.success) {
    throw new Error('work not found');
  }
  const dom = new JSDOM(work.content);

  const images = dom.window.document.querySelectorAll('img');

  const cssContents = Object.keys(exportRequiredStylesheets).map((ss) => {
    return fs.readFileSync(`${__dirname}/resources/${exportRequiredStylesheets[ss]}`, 'utf8');
  });

  const jsContents = Object.keys(exportRequiredScripts).map((sc) => {
    return fs.readFileSync(`${__dirname}/resources/${exportRequiredScripts[sc]}`, 'utf8');
  });

  if (dom.window.document.querySelector('div.sc-block[data-block-type=latex]')) {
    cssContents.push(fs.readFileSync(`${__dirname}/resources/katex.min.css`, 'utf8'));
    jsContents.push(fs.readFileSync(`${__dirname}/resources/katex.min.js`, 'utf8'));
  }

  await Promise.all(Array.prototype.map.call(images, (img) => {
    const etag = img.getAttribute('data-file-etag');

    return new Promise((resolve) => {
      request.get({
        url: `http://${config.qiniu_bucket}/${etag}`,
        encoding: null, /* API
        encoding - encoding to be used on setEncoding of response data.
        If null, the body is returned as a Buffer.
        Anything else (including the default value of undefined) will
        be passed as the encoding parameter to toString()
        (meaning this is effectively utf8 by default).
        (Note: if you expect binary data, you should set encoding: null.) */
      }, (err, httpResponse, body) => {
        const mime = httpResponse.headers['content-type'];

        const dataURL = `data:${mime};base64, ${body.toString('base64')}`;
        img.setAttribute('src', dataURL);
        resolve(true);
      });
    });
  }));

  let newHTML = rawHTML.replace('__TITLE__', work.title);
  newHTML = newHTML.replace('__STYLESHEET__', cssContents.join('\n'));
  newHTML = newHTML.replace('__SCRIPTS__', jsContents.join('\n'));
  newHTML = newHTML.replace('__REVEAL__', dom.window.document.querySelector('.slides').outerHTML);

  res.setHeader('content-type', 'text/html');
  res.setHeader('content-disposition', 'attachment; filename="syncollege_work_offline.html"');

  return res.send(newHTML);
};
