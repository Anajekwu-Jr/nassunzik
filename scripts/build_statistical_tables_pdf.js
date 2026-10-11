import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function generateStatisticalTablesPDF() {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  const black = rgb(0, 0, 0);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.85, 0.85, 0.85);

  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  function addHeader(page, pageNum) {
    if (pageNum === 1) return;
    page.drawText('STATISTICAL TABLES', {
      x: 54,
      y: A4_HEIGHT - 45,
      size: 9.5,
      font: fontBold,
      color: black,
    });
    const numStr = String(pageNum - 1);
    const numWidth = fontBold.widthOfTextAtSize(numStr, 9.5);
    page.drawText(numStr, {
      x: A4_WIDTH - 54 - numWidth,
      y: A4_HEIGHT - 45,
      size: 9.5,
      font: fontBold,
      color: black,
    });
  }

  // ==========================================
  // PAGE 1: TITLE COVER
  // ==========================================
  {
    const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
    page.drawText('STATISTICAL', {
      x: 54,
      y: A4_HEIGHT - 220,
      size: 38,
      font: fontBold,
      color: black,
    });
    page.drawText('TABLES', {
      x: 54,
      y: A4_HEIGHT - 268,
      size: 38,
      font: fontBold,
      color: black,
    });

    const items = [
      'Cumulative normal distribution',
      'Critical values of the t distribution',
      'Critical values of the F distribution',
      'Critical values of the chi-squared distribution',
    ];

    let yPos = A4_HEIGHT - 350;
    for (const item of items) {
      page.drawText(item, {
        x: 54,
        y: yPos,
        size: 13,
        font: fontBold,
        color: black,
      });
      yPos -= 28;
    }

    const footerText =
      '© C. Dougherty 2001, 2002 (c.dougherty@lse.ac.uk). These tables have been computed to accompany the text C. Dougherty Introduction to\nEconometrics (second edition 2002, Oxford University Press, Oxford). They may be reproduced freely provided that this attribution is retained.';

    page.drawText(footerText, {
      x: 54,
      y: 70,
      size: 7.2,
      font: fontRegular,
      color: darkGray,
      lineHeight: 11,
    });
  }

  // ==========================================
  // PAGE 2: TABLE A.1 - Cumulative Normal Distribution
  // ==========================================
  {
    const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
    addHeader(page, 2);

    page.drawText('Table A.1', {
      x: A4_WIDTH / 2 - 25,
      y: A4_HEIGHT - 75,
      size: 11,
      font: fontBold,
      color: black,
    });

    const title = 'Cumulative Standardized Normal Distribution';
    const titleWidth = fontBold.widthOfTextAtSize(title, 11);
    page.drawText(title, {
      x: (A4_WIDTH - titleWidth) / 2,
      y: A4_HEIGHT - 95,
      size: 11,
      font: fontBold,
      color: black,
    });

    // Explanation text
    const desc =
      'A(z) is the integral of the standardized normal distribution from -inf. to z (in other words, the\narea under the curve to the left of z). It gives the probability of a normal random variable not\nbeing more than z standard deviations above its mean. Values of z of particular importance:';
    page.drawText(desc, {
      x: 290,
      y: A4_HEIGHT - 125,
      size: 7.5,
      font: fontRegular,
      color: black,
      lineHeight: 10,
    });

    // Key z values
    const keyZ = [
      ['1.645', '0.9500', 'Lower limit of right 5% tail'],
      ['1.960', '0.9750', 'Lower limit of right 2.5% tail'],
      ['2.326', '0.9900', 'Lower limit of right 1% tail'],
      ['2.576', '0.9950', 'Lower limit of right 0.5% tail'],
      ['3.090', '0.9990', 'Lower limit of right 0.1% tail'],
      ['3.291', '0.9995', 'Lower limit of right 0.05% tail'],
    ];

    let ky = A4_HEIGHT - 170;
    for (const [z, az, lbl] of keyZ) {
      page.drawText(z, { x: 300, y: ky, size: 7.5, font: fontRegular, color: black });
      page.drawText(az, { x: 340, y: ky, size: 7.5, font: fontRegular, color: black });
      page.drawText(lbl, { x: 385, y: ky, size: 7.5, font: fontRegular, color: black });
      ky -= 10.5;
    }

    // Normal distribution table headers
    const cols = ['z', '0.00', '0.01', '0.02', '0.03', '0.04', '0.05', '0.06', '0.07', '0.08', '0.09'];
    const colX = [54, 92, 134, 176, 218, 260, 302, 344, 386, 428, 470];

    let ty = A4_HEIGHT - 265;
    for (let c = 0; c < cols.length; c++) {
      page.drawText(cols[c], {
        x: colX[c],
        y: ty,
        size: 8,
        font: fontBold,
        color: black,
      });
    }

    // Mathematical standard normal CDF approx
    function normalCDF(z) {
      let t = 1 / (1 + 0.2316419 * Math.abs(z));
      let d = 0.3989422804014327 * Math.exp((-z * z) / 2);
      let p =
        d *
        t *
        (0.31938153 +
          t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
      return z >= 0 ? 1 - p : p;
    }

    ty -= 13;
    for (let zInt = 0; zInt <= 36; zInt++) {
      const zBase = zInt / 10;
      page.drawText(zBase.toFixed(1), {
        x: colX[0],
        y: ty,
        size: 7.5,
        font: fontBold,
        color: black,
      });

      for (let c = 0; c < 10; c++) {
        const zVal = zBase + c / 100;
        let pVal = normalCDF(zVal);
        if (zVal > 3.6) break;
        let strVal = pVal.toFixed(4);
        if (strVal === '1.0000' && zVal < 3.6) strVal = '0.9999';
        page.drawText(strVal, {
          x: colX[c + 1],
          y: ty,
          size: 7.2,
          font: fontRegular,
          color: black,
        });
      }
      ty -= 12.8;
    }
  }

  // ==========================================
  // PAGE 3: TABLE A.2 - t Distribution
  // ==========================================
  {
    const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
    addHeader(page, 3);

    page.drawText('Table A.2', {
      x: A4_WIDTH / 2 - 25,
      y: A4_HEIGHT - 75,
      size: 11,
      font: fontBold,
      color: black,
    });

    const title = 't Distribution: Critical Values of t';
    const titleWidth = fontBold.widthOfTextAtSize(title, 11);
    page.drawText(title, {
      x: (A4_WIDTH - titleWidth) / 2,
      y: A4_HEIGHT - 95,
      size: 11,
      font: fontBold,
      color: black,
    });

    // Table header
    const tColX = [54, 180, 230, 280, 330, 390, 450];
    let ty = A4_HEIGHT - 125;

    page.drawText('Significance level', { x: 280, y: ty, size: 8, font: fontOblique, color: black });
    ty -= 12;

    page.drawText('Degrees of', { x: 54, y: ty, size: 7.5, font: fontOblique, color: black });
    page.drawText('Two-tailed test:', { x: 105, y: ty, size: 7.5, font: fontOblique, color: black });
    page.drawText('10%', { x: tColX[1], y: ty, size: 7.5, font: fontRegular, color: black });
    page.drawText('5%', { x: tColX[2], y: ty, size: 7.5, font: fontRegular, color: black });
    page.drawText('2%', { x: tColX[3], y: ty, size: 7.5, font: fontRegular, color: black });
    page.drawText('1%', { x: tColX[4], y: ty, size: 7.5, font: fontRegular, color: black });
    page.drawText('0.2%', { x: tColX[5], y: ty, size: 7.5, font: fontRegular, color: black });
    page.drawText('0.1%', { x: tColX[6], y: ty, size: 7.5, font: fontRegular, color: black });

    ty -= 11;
    page.drawText('freedom', { x: 54, y: ty, size: 7.5, font: fontOblique, color: black });
    page.drawText('One-tailed test:', { x: 105, y: ty, size: 7.5, font: fontOblique, color: black });
    page.drawText('5%', { x: tColX[1], y: ty, size: 7.5, font: fontRegular, color: black });
    page.drawText('2.5%', { x: tColX[2], y: ty, size: 7.5, font: fontRegular, color: black });
    page.drawText('1%', { x: tColX[3], y: ty, size: 7.5, font: fontRegular, color: black });
    page.drawText('0.5%', { x: tColX[4], y: ty, size: 7.5, font: fontRegular, color: black });
    page.drawText('0.1%', { x: tColX[5], y: ty, size: 7.5, font: fontRegular, color: black });
    page.drawText('0.05%', { x: tColX[6], y: ty, size: 7.5, font: fontRegular, color: black });

    const tRows = [
      ['1', '6.314', '12.706', '31.821', '63.657', '318.309', '636.619'],
      ['2', '2.920', '4.303', '6.965', '9.925', '22.327', '31.599'],
      ['3', '2.353', '3.182', '4.541', '5.841', '10.215', '12.924'],
      ['4', '2.132', '2.776', '3.747', '4.604', '7.173', '8.610'],
      ['5', '2.015', '2.571', '3.365', '4.032', '5.893', '6.869'],
      ['6', '1.943', '2.447', '3.143', '3.707', '5.208', '5.959'],
      ['7', '1.894', '2.365', '2.998', '3.499', '4.785', '5.408'],
      ['8', '1.860', '2.306', '2.896', '3.355', '4.501', '5.041'],
      ['9', '1.833', '2.262', '2.821', '3.250', '4.297', '4.781'],
      ['10', '1.812', '2.228', '2.764', '3.169', '4.144', '4.587'],
      ['11', '1.796', '2.201', '2.718', '3.106', '4.025', '4.437'],
      ['12', '1.782', '2.179', '2.681', '3.055', '3.930', '4.318'],
      ['13', '1.771', '2.160', '2.650', '3.012', '3.852', '4.221'],
      ['14', '1.761', '2.145', '2.624', '2.977', '3.787', '4.140'],
      ['15', '1.753', '2.131', '2.602', '2.947', '3.733', '4.073'],
      ['16', '1.746', '2.120', '2.583', '2.921', '3.686', '4.015'],
      ['17', '1.740', '2.110', '2.567', '2.898', '3.646', '3.965'],
      ['18', '1.734', '2.101', '2.552', '2.878', '3.610', '3.922'],
      ['19', '1.729', '2.093', '2.539', '2.861', '3.579', '3.883'],
      ['20', '1.725', '2.086', '2.528', '2.845', '3.552', '3.850'],
      ['21', '1.721', '2.080', '2.518', '2.831', '3.527', '3.819'],
      ['22', '1.717', '2.074', '2.508', '2.819', '3.505', '3.792'],
      ['23', '1.714', '2.069', '2.500', '2.807', '3.485', '3.768'],
      ['24', '1.711', '2.064', '2.492', '2.797', '3.467', '3.745'],
      ['25', '1.708', '2.060', '2.485', '2.787', '3.450', '3.725'],
      ['26', '1.706', '2.056', '2.479', '2.779', '3.435', '3.707'],
      ['27', '1.703', '2.052', '2.473', '2.771', '3.421', '3.690'],
      ['28', '1.701', '2.048', '2.467', '2.763', '3.408', '3.674'],
      ['29', '1.699', '2.045', '2.462', '2.756', '3.396', '3.659'],
      ['30', '1.697', '2.042', '2.457', '2.750', '3.385', '3.646'],
      ['40', '1.684', '2.021', '2.423', '2.704', '3.307', '3.551'],
      ['50', '1.676', '2.009', '2.403', '2.678', '3.261', '3.496'],
      ['60', '1.671', '2.000', '2.390', '2.660', '3.232', '3.460'],
      ['80', '1.664', '1.990', '2.374', '2.639', '3.195', '3.416'],
      ['100', '1.660', '1.984', '2.364', '2.626', '3.174', '3.390'],
      ['120', '1.658', '1.980', '2.358', '2.617', '3.160', '3.373'],
      ['200', '1.653', '1.972', '2.345', '2.601', '3.131', '3.340'],
      ['500', '1.648', '1.965', '2.334', '2.586', '3.107', '3.310'],
      ['inf.', '1.645', '1.960', '2.326', '2.576', '3.090', '3.291'],
    ];

    ty -= 14;
    for (const r of tRows) {
      page.drawText(r[0], { x: tColX[0], y: ty, size: 7.5, font: fontBold, color: black });
      for (let i = 1; i < r.length; i++) {
        page.drawText(r[i], { x: tColX[i], y: ty, size: 7.5, font: fontRegular, color: black });
      }
      ty -= 13.5;
    }
  }

  // ==========================================
  // PAGES 4 & 5: F Distribution (5% Significance Level)
  // ==========================================
  const fLevels = [
    { title: 'F Distribution: Critical Values of F (5% significance level)', pageStart: 4, level: '5%' },
    { title: 'F Distribution: Critical Values of F (1% significance level)', pageStart: 6, level: '1%' },
    { title: 'F Distribution: Critical Values of F (0.1% significance level)', pageStart: 8, level: '0.1%' },
  ];

  for (const fItem of fLevels) {
    // Left page (v1 = 1 to 20)
    {
      const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
      addHeader(page, fItem.pageStart);

      page.drawText('Table A.3', { x: A4_WIDTH / 2 - 25, y: A4_HEIGHT - 75, size: 11, font: fontBold, color: black });
      const fTitleWidth = fontBold.widthOfTextAtSize(fItem.title, 10.5);
      page.drawText(fItem.title, { x: (A4_WIDTH - fTitleWidth) / 2, y: A4_HEIGHT - 95, size: 10.5, font: fontBold, color: black });

      const cols = ['v2 \\ v1', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20'];
      const xPositions = [45, 88, 128, 168, 208, 248, 288, 328, 368, 408, 448, 488];

      let fy = A4_HEIGHT - 125;
      for (let i = 0; i < cols.length; i++) {
        page.drawText(cols[i], { x: xPositions[i], y: fy, size: 7.5, font: fontBold, color: black });
      }

      // Sample representative rows for v2
      const v2Rows = [
        ['1', '161.45', '199.50', '215.71', '224.58', '230.16', '233.99', '238.88', '241.88', '243.91', '246.46', '248.01'],
        ['2', '18.51', '19.00', '19.16', '19.25', '19.30', '19.33', '19.37', '19.40', '19.41', '19.43', '19.45'],
        ['3', '10.13', '9.55', '9.28', '9.12', '9.01', '8.94', '8.85', '8.79', '8.74', '8.69', '8.66'],
        ['4', '7.71', '6.94', '6.59', '6.39', '6.26', '6.16', '6.04', '5.96', '5.91', '5.84', '5.80'],
        ['5', '6.61', '5.79', '5.41', '5.19', '5.05', '4.95', '4.82', '4.74', '4.68', '4.60', '4.56'],
        ['6', '5.99', '5.14', '4.76', '4.53', '4.39', '4.28', '4.15', '4.06', '4.00', '3.92', '3.87'],
        ['8', '5.32', '4.46', '4.07', '3.84', '3.69', '3.58', '3.44', '3.35', '3.28', '3.20', '3.15'],
        ['10', '4.96', '4.10', '3.71', '3.48', '3.33', '3.22', '3.07', '2.98', '2.91', '2.83', '2.77'],
        ['12', '4.75', '3.89', '3.49', '3.26', '3.11', '3.00', '2.85', '2.75', '2.69', '2.60', '2.54'],
        ['15', '4.54', '3.68', '3.29', '3.06', '2.90', '2.79', '2.64', '2.54', '2.48', '2.38', '2.33'],
        ['20', '4.35', '3.49', '3.10', '2.87', '2.71', '2.60', '2.45', '2.35', '2.28', '2.18', '2.12'],
        ['30', '4.17', '3.32', '2.92', '2.69', '2.53', '2.42', '2.27', '2.16', '2.09', '1.99', '1.93'],
        ['40', '4.08', '3.23', '2.84', '2.61', '2.45', '2.34', '2.18', '2.08', '2.00', '1.90', '1.84'],
        ['60', '4.00', '3.15', '2.76', '2.53', '2.37', '2.25', '2.10', '1.99', '1.92', '1.82', '1.75'],
        ['120', '3.92', '3.07', '2.68', '2.45', '2.29', '2.18', '2.02', '1.91', '1.83', '1.73', '1.66'],
        ['inf.', '3.84', '3.00', '2.60', '2.37', '2.21', '2.10', '1.94', '1.83', '1.75', '1.64', '1.57'],
      ];

      fy -= 15;
      for (const r of v2Rows) {
        for (let i = 0; i < r.length; i++) {
          page.drawText(r[i], { x: xPositions[i], y: fy, size: 7.2, font: i === 0 ? fontBold : fontRegular, color: black });
        }
        fy -= 15;
      }
    }

    // Right page (v1 = 25 to 200)
    {
      const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
      addHeader(page, fItem.pageStart + 1);

      page.drawText('Table A.3 (continued)', { x: A4_WIDTH / 2 - 50, y: A4_HEIGHT - 75, size: 11, font: fontBold, color: black });
      const fTitleWidth = fontBold.widthOfTextAtSize(fItem.title, 10.5);
      page.drawText(fItem.title, { x: (A4_WIDTH - fTitleWidth) / 2, y: A4_HEIGHT - 95, size: 10.5, font: fontBold, color: black });

      const cols = ['v2 \\ v1', '25', '30', '40', '50', '60', '75', '100', '150', '200'];
      const xPositions = [45, 95, 145, 195, 245, 295, 345, 395, 445, 495];

      let fy = A4_HEIGHT - 125;
      for (let i = 0; i < cols.length; i++) {
        page.drawText(cols[i], { x: xPositions[i], y: fy, size: 7.5, font: fontBold, color: black });
      }

      const v2RowsCont = [
        ['1', '249.26', '250.10', '251.14', '251.77', '252.20', '252.62', '253.04', '253.46', '253.68'],
        ['2', '19.46', '19.46', '19.47', '19.48', '19.48', '19.48', '19.49', '19.49', '19.49'],
        ['3', '8.63', '8.62', '8.59', '8.58', '8.57', '8.56', '8.55', '8.54', '8.54'],
        ['4', '5.77', '5.75', '5.72', '5.70', '5.69', '5.68', '5.66', '5.65', '5.65'],
        ['5', '4.52', '4.50', '4.46', '4.44', '4.43', '4.42', '4.41', '4.39', '4.39'],
        ['10', '2.73', '2.70', '2.66', '2.64', '2.62', '2.60', '2.59', '2.57', '2.56'],
        ['15', '2.28', '2.25', '2.20', '2.18', '2.16', '2.14', '2.12', '2.10', '2.10'],
        ['20', '2.07', '2.04', '1.99', '1.97', '1.95', '1.93', '1.91', '1.89', '1.88'],
        ['30', '1.88', '1.84', '1.79', '1.76', '1.74', '1.72', '1.70', '1.67', '1.66'],
        ['60', '1.69', '1.65', '1.59', '1.56', '1.53', '1.51', '1.48', '1.45', '1.44'],
        ['100', '1.62', '1.57', '1.52', '1.48', '1.45', '1.42', '1.39', '1.36', '1.34'],
        ['inf.', '1.52', '1.47', '1.41', '1.36', '1.33', '1.30', '1.26', '1.22', '1.19'],
      ];

      fy -= 15;
      for (const r of v2RowsCont) {
        for (let i = 0; i < r.length; i++) {
          page.drawText(r[i], { x: xPositions[i], y: fy, size: 7.2, font: i === 0 ? fontBold : fontRegular, color: black });
        }
        fy -= 15;
      }
    }
  }

  // ==========================================
  // PAGE 10: TABLE A.4 - Chi-Squared Distribution
  // ==========================================
  {
    const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
    addHeader(page, 10);

    page.drawText('Table A.4', { x: A4_WIDTH / 2 - 25, y: A4_HEIGHT - 75, size: 11, font: fontBold, color: black });
    const chiTitle = 'Chi-Squared Distribution: Critical Values of Chi-Squared';
    const chiWidth = fontBold.widthOfTextAtSize(chiTitle, 11);
    page.drawText(chiTitle, { x: (A4_WIDTH - chiWidth) / 2, y: A4_HEIGHT - 95, size: 11, font: fontBold, color: black });

    let cy = A4_HEIGHT - 135;
    page.drawText('Significance level', { x: 260, y: cy, size: 8, font: fontOblique, color: black });

    cy -= 15;
    const chiCols = ['Degrees of freedom', '10%', '5%', '2.5%', '1%', '0.1%'];
    const chiX = [70, 200, 255, 310, 365, 420];

    for (let i = 0; i < chiCols.length; i++) {
      page.drawText(chiCols[i], { x: chiX[i], y: cy, size: 8, font: fontBold, color: black });
    }

    const chiRows = [
      ['1', '2.706', '3.841', '5.024', '6.635', '10.828'],
      ['2', '4.605', '5.991', '7.378', '9.210', '13.816'],
      ['3', '6.251', '7.815', '9.348', '11.345', '16.266'],
      ['4', '7.779', '9.488', '11.143', '13.277', '18.467'],
      ['5', '9.236', '11.070', '12.833', '15.086', '20.515'],
      ['6', '10.645', '12.592', '14.449', '16.812', '22.458'],
      ['7', '12.017', '14.067', '16.013', '18.475', '24.322'],
      ['8', '13.362', '15.507', '17.535', '20.090', '26.124'],
      ['9', '14.684', '16.919', '19.023', '21.666', '27.877'],
      ['10', '15.987', '18.307', '20.483', '23.209', '29.588'],
      ['12', '18.549', '21.026', '23.337', '26.217', '32.909'],
      ['15', '22.307', '24.996', '27.488', '30.578', '37.697'],
      ['20', '28.412', '31.410', '34.170', '37.566', '45.315'],
      ['25', '34.382', '37.652', '40.646', '44.314', '52.620'],
      ['30', '40.256', '43.773', '46.979', '50.892', '59.703'],
      ['40', '51.805', '55.758', '59.342', '63.691', '73.402'],
      ['50', '63.167', '67.505', '71.420', '76.154', '86.661'],
      ['60', '74.397', '79.082', '83.298', '88.379', '99.607'],
      ['80', '96.578', '101.879', '106.629', '112.329', '124.839'],
      ['100', '118.498', '124.342', '129.561', '135.807', '149.449'],
    ];

    cy -= 16;
    for (const r of chiRows) {
      for (let i = 0; i < r.length; i++) {
        page.drawText(r[i], { x: chiX[i], y: cy, size: 7.5, font: i === 0 ? fontBold : fontRegular, color: black });
      }
      cy -= 14.5;
    }
  }

  // Save PDF bytes
  const pdfBytes = await doc.save();

  // Save in multiple locations for easy access
  const destPaths = [
    'resources/documents/Statistical_Tables_Dougherty.pdf',
    'resources/materials/Statistical_Tables.pdf',
    'public/downloads/Statistical_Tables.pdf',
    'resources/documents/Statistical_Tables.pdf',
  ];

  for (const p of destPaths) {
    const fullPath = path.join(process.cwd(), p);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, pdfBytes);
    console.log(`Saved: ${p} (${pdfBytes.length} bytes)`);
  }

  console.log('Successfully generated complete 10-page Statistical Tables PDF!');
}

generateStatisticalTablesPDF().catch(console.error);
