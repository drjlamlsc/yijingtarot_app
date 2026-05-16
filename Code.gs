// ============================================================
//  易經塔羅 Web App — Server-side (Google Apps Script)
// ============================================================

var SPREADSHEET_ID = '1AqT7hSOvaxVLQrisSQ7i5av23aVWHax8CIAWUhgf_2c';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('易經塔羅')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Fallback: called by client if fetch('cards.json') fails in GAS context
// Reads card data live from the Yijing Tarot Notes spreadsheet
function getCardsData() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  var rows  = sheet.getDataRange().getValues();

  // Card image file IDs (Drive folder: yijing_tarot_cards)
  var IMG_IDS = {
    1:'1yZFQE6LDnYvUeSm5biBK8Yjy8AicYTL6', 2:'1wM2rOqCYepcpcqqLmA9his67EuBaRlcG',
    3:'1D1hzgyNtYABVOUxNWflUq6YsaOxW9-ci', 4:'1IkqzHU112p35xuQs4LhBirPooFyMKiFs',
    5:'1eVuTSRUOjg5fk2M9ObTMTw2bQCVQvDcN', 6:'1qXMikfAqa4bG_nAH06ZZa29qvihe8rfo',
    7:'1brdtvL9B_PTNR0PxkeaBf-KHcJlYm_lb', 8:'1DcI272VjWuT5ek-1wn9yjNt8IkVRsA8g',
    9:'1TALFvEvztcDMm-kWZHd1RFk2tL7wu_Gn', 10:'10S2kiX1IKYQ-3UX3FU1TyUTQj48SqGxI',
    11:'1EA_wbfbuf968oYqNKXNG01h6bBhrVRjK', 12:'1SRmkqx2i5NIFmbZEDthUPLomRRAz80M3',
    13:'1IKe1WKFrwVGnqHON-e6JkYvCAXBTC9rp', 14:'1ByrGsEtlLGRwaFrKp9yZeN6v9oUk8766',
    15:'1T0j5GjoXHx5s2t6vhDEhyCfIx6v9gPKu', 16:'1VnJow5iXfU_w8wahNZAAHU8r2g5eO4XC',
    17:'1Y4KYjZBDjy_HVSNNOcxeylnLdchoSLGz', 18:'1_tu4KLB8aBc74tIO3mZNF9alS36jAzym',
    19:'1c99O8GA1bBoR4s9_4pWjmRY2dAJ0gbP6', 20:'18_PsPyvbKe6P3pA0Q-nDHYwRntbs00rQ',
    21:'1BVE-uGqR0CvYIMf5tuzXyv7BqyJP_KfX', 22:'1gnOwarCdu4T5YVhKr5YswLVhn6boH7nN',
    23:'11Nedt_fv903F07y-sl05d_ztMN9T1IdI',  24:'1cztmVg-y-yAH19wm9d5Y2TbiiFh2_j8C',
    25:'10OkmKxUapLqSh_41Kih-_CZ0aSQ4L7du', 26:'1V9o2yu762k88jwzA7G517PuUBYvOnXHC',
    27:'1vA1oCp58qWaolxsxb5G6TnBtXwXP7IJ0', 28:'1tlTe5_EL1MRq2ye4Y4MmcYgYKXt6Ejl8',
    29:'1uz-GxpjxHDpjruRwzmZYhet3qA-Lei8X',  30:'1h0_z4q2nPSuMeJPDDoaHrRxO81oqdJBv',
    31:'1U9EsSd92CquDhfewjF2xB1LEitHhKSsI',  32:'1JNsW1PSN7cMzetgUiss2UAVRp6HC2cHE',
    33:'1c0NflOBhzc0bnYhh4n4keYiQcN3LV7yd',  34:'1Ba_y2Ax4W63QTahvST7r0QkP8RHrvswI',
    35:'1dtEPzoLSUGnVKILDWYQIUwLKsWe7V81S',  36:'1K1oE6RqemXF0A0GKsOJtF8CyaagdT7iY',
    37:'1pX7oxr5SzLw12rH0hJznhi_KDUSgrgQP',  38:'1ywki_NqPNnLedxQ62_0sh8XcC8E1PGwX',
    39:'134DK4k_vsQ6XJPbE0D-QuVSDO94y6wZM',  40:'1B4MOT6GTYmNltWKyQfX88HdediEZsdoD',
    41:'1JPk0ey-TCK3QxX0wOSVdUxSw0bhBdxU-',  42:'1HAHkixbiVzp6krwszzE62to-UnmK9amE',
    43:'19AFLA9-LK7wb47mUa2PMNPR4OQ6C31YM',  44:'1Si5uI9zudYz4hNZEMvDnUBiF2txO-TWK',
    45:'1Hau0UEp810kjgTjmLArqxQsAeDC0rk2S',  46:'111MTeO5tVIdlvJOTJVbjI2Ai751WY0Ue',
    47:'1SPlOf7XfOEn4gozcdlB3Qo-thnqN-KMg',  48:'1pbfwavYtC9J2sQSfPsCmKE4eYMoCb7xq',
    49:'1FWIktthGXm70daAQD6-DAe58lm4b7aMc',  50:'1QKd8J9W49ZtJbP9_jCsnYBgE1uPoDxBU',
    51:'1Z14o-rhPr3Dx2nlspDX7xRqSgF0Y9qof',  52:'1NN0BaBkxiXsZabAIiFZavOuwjYRIi84k',
    53:'1qgFwxgc37QNphnj5BExDHCiJ22cNCaGR',  54:'16Lw4vyC4oDXtfrOUo9z78KllgVVy8m8J',
    55:'154otJotrIJjBsbdFCMTPh9mpeavbTe2d',  56:'1Drqlc5JCjHfqCYdbWo5hfZqLTldzXpBZ',
    57:'1Un5-jFMBHENtc20pDmMX7zFnGMqnO4P1',  58:'1BGyU8_26H976grJc1cwZl3wCvzDPjqoJ',
    59:'1r8L3HBMS_W__ybqmJooUaar0i6GLquH_',  60:'1I8ATBYJPB9Qcg8k0UsaC2SI6aj0EZwGB',
    61:'1hsIsyluoIkT1Kpr3BLb9tSfwR3FE0pa7',  62:'11t7S1t7qCXKsEqxpXAnbgiuAX1j6O9Xx',
    63:'1n90WQCNXbrngg2Vu4RGcqfGb5VYHWZaq',  64:'1OzZ2_bghl9FQvONaR8WHAV6_nx6JK5Yv'
  };

  var cards = [];
  // Sheet rows: header = row 0, data starts row 1
  // Columns: 卦序 | 卦名 | 基礎牌義 | 戀愛運勢 | 職場/財運/性格
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var num = parseInt(row[0]);
    if (!num || num < 1 || num > 64) continue;
    cards.push({
      num:   num,
      name:  String(row[1]),
      imgId: IMG_IDS[num] || '',
      lvl1:  String(row[2]),
      lvl2:  String(row[3]),
      lvl3:  String(row[4])
    });
  }
  // Sort by num in case sheet rows are out of order
  cards.sort(function (a, b) { return a.num - b.num; });
  return cards;
}
