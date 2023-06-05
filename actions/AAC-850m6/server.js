function(properties, context) {

  const axios = require('axios');
  const pdf = require('pdf-parse');

  function parsePDF(url) {
    let dataBuffer;

    return new Promise((resolve, reject) => {
      axios
        .get(url, { responseType: 'arraybuffer' })
        .then(response => {
          dataBuffer = Buffer.from(response.data, 'binary');
          return pdf(dataBuffer);
        })
        .then(data => {
          if (data.text) {
            // Replace multiple consecutive whitespace characters with a single space
            const cleanedText = data.text.replace(/\s+/g, ' ');
            // Convert the info object into a string
            const infoString = JSON.stringify(data.info);
            resolve({ text: cleanedText, info: infoString });
          } else {
            reject(new Error('Unable to parse PDF text.'));
          }
        })
        .catch(error => {
          if (!dataBuffer) {
            reject(new Error('Error: Failed to fetch PDF data.'));
          } else {
            reject(new Error(`Error: ${error.message}`));
          }
        });
    });
  }

  // Usage:
  function runParsing() {
    const pdfUrl = properties.pdf;
    return parsePDF(pdfUrl);
  }

  return runParsing();
}
