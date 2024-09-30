const axios = require('axios');
const pdf = require('pdf-parse');

// Fonction pour vérifier si une URL est valide
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

// Fonction principale pour analyser le PDF
async function parsePDF(url) {
  if (!isValidUrl(url)) {
    throw new Error('URL invalide');
  }

  try {
    // Récupérer le PDF sous forme de tampon binaire
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000 // Timeout de 10 secondes
    });

    const dataBuffer = Buffer.from(response.data, 'binary');
    const data = await pdf(dataBuffer);

    // Si aucun texte n'est trouvé, lever une erreur
    if (!data.text) {
      throw new Error('Impossible d’extraire du texte du PDF.');
    }

    // Nettoyage du texte (élimination des espaces multiples et des caractères invisibles)
    const cleanedText = data.text
      .replace(/\s+/g, ' ')        // Remplacer les espaces multiples par un seul
      .replace(/[^\x20-\x7E]+/g, '') // Supprimer les caractères non imprimables (hors ASCII)
      .trim();                     // Supprimer les espaces en début et fin de chaîne

    // Conversion des métadonnées en JSON
    const infoString = JSON.stringify(data.info);

    // Retourner le texte nettoyé et les métadonnées
    return { text: cleanedText, info: infoString };

  } catch (error) {
    if (error.response) {
      // Problèmes spécifiques à la réponse HTTP
      throw new Error(`Erreur HTTP : ${error.response.status} ${error.response.statusText}`);
    } else if (error.code === 'ECONNABORTED') {
      // Erreur de timeout
      throw new Error('La requête a pris trop de temps et a été abandonnée.');
    } else {
      // Autres erreurs (format PDF, réseau, etc.)
      throw new Error(`Erreur : ${error.message}`);
    }
  }
}

// Fonction pour exécuter l'analyse du PDF
async function runParsing() {
  const pdfUrl = properties.pdf;
  
  try {
    const result = await parsePDF(pdfUrl);
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

// Appel final
return runParsing();
