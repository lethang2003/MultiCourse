const initializeApp = require("firebase/app").initializeApp;

const serviceAccount = {
  type: "service_account",
  project_id: "multicourse-e86d1",
  private_key_id: "9512ad03e1f92000ccb2ccf2cc1e9861fa9a84e2",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCtrStWrYQfC1cj\nf/20V6qJZKXVBjlqoXJ8Yta9e6C6B++wlvtXDp/uu5rQ5/U4D5o26pj9Y5+a/a3M\nmQqt2C5OMgnPoHhCpEq9tTfU4WSnlZDkAM+97hFRAyCZcCusZPhLjakjo7suG/H8\ngj1Gt5Wyo27vu6h7slscWE1rgGd3SyEAZHfaqjwtrASYx9E8Eecp6wjsL2cR3Thk\nPk2i7+0CVF2nOs9hG1iIl9VOHHnn2i+yJAE4fM6LBrhbT9INEsTdXbJY42HZiUJZ\nC5pbc1/WtHgxmmMC7ou+sBqY2LyBzOP7plRO3ZGQ+jKUP95uJ7Ap803RopleLXRs\nF5iFuAdNAgMBAAECgf8faW3C6edB2+xyTfVS8fgUBSjoZd6eMvqJR+zUM4WOV/3M\nmMPl2n0zkXWlBt3BZ+WmJcNGTq4DHdyad41crhxiLq+VfFyjC+7qCBfRA+JVVsFL\nbEzcZ9aaeKK+9pCyC6jV4qdaPH08COvDjdz2jpllkeGptH1u68DDToZmn+/CzRLP\nOhuKdwM0Y/DpmN57d8y0n+lHBmF7auZmuUVYEktGKAwZs9JyPc5tuZecozb7A2vd\nBqq7CPHXUoSX36PUC/6buV/eDVPgcqAkQ8vr/zp7stpL7MSgqm9CzalNgOoiZqy6\nx/MauCa1M+wvTD/J4of2HVfQLARqOgBWAWd3X5ECgYEA5Uy3oZImHyexM3D6qtky\nL2RJHvUQLIRyIeg2i46CwrxgkKdqbJGyijZWXr/BzeJb7OQ/gzuCxIGFEIcfPWcZ\nijDEsUf7g69PDN6N3WssIb3mKdUqv8OzEVk6Nhd6rs98MZ/Awk01K5GgdLrCLxoj\nJ27ZLzVOE+rCoEFIHXJK7dECgYEAweZbhG3KZxLvGNZc+hP/iV9jZHfF9YAJ34Js\ncSaKw/stgWwPchlb6c3EDj/7FfGqiVZpo2Ztst0mkrdTEhfY5iRpyUdBtvb7a/LY\namZlVY+XCk+Gs95SGnXwp1HI1QhgLcIC0oCJ3ivFC87kHca0SATqC34SjYVI2Wkv\nUTiYNL0CgYBYda9GCr7gOAzZnpVlweLle5fl9H7n3bS2NgKM9k6l18ydIakh91dc\nkLfjV7Dpv5DdI/UIqLW7H4h5Jte7dYHZ2RSYm/+A/unNOjKaoBTnc35O1yjl0BbN\n85FMeuReejccYdgYXXbMtyKixcXSLBAxz0bEOplDf8bT0juC+KvFcQKBgBTmV4b2\nrpJdoBf1QyBRd4G/Hl996YCExIuq6zVnCh4FvOnuU9vgj9+rpi5DBzVeTxtujQRn\nzfsxiy7VQ8b3exGTazOe0p5+EKuaCWmuj82hJI6f88z/caoYfFAMqLENrhBAkT1P\nTYz8+shDDKOI/3Wj0fZbKHTIoQmOJOOETiOhAoGBAN9HCa8TMTiW5VAhS4JsPHJv\nLVC2l7nOsiFSqws6pJ/wr00hqTbPxP8MQTqfXCLODlbvC/T1twE9grsnd1KAzTs+\ncW/9PiQSpy1d90a9R9FY+tOOuZGJuCBK1Nky2B6xZIu4L0wj5SMjm5VoFYV+PCwg\n/FRr8mnohiesBNax+TZE\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-otd5l@multicourse-e86d1.iam.gserviceaccount.com",
  client_id: "115008517136620469906",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-otd5l%40multicourse-e86d1.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

// Initialize Firebase
const app = initializeApp(serviceAccount);
module.exports = { app, serviceAccount };
