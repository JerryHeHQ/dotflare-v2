// Firebase (Cloud Firestore) backend initialization
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import 'firebase/compat/storage';
import firebaseConfig from "../FirebaseDocuments/FirebaseConfig";
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// Checks if the given token is unique in the database.
// token: a six digit integer
// return: true if six digit integer is unique and false otherwise
async function isTokenUnique(token) {
  const db = firebase.firestore();
  const docRef = db.collection('sessions').doc(token.toString());
  const doc = await docRef.get();
  return !doc.exists;
}

// Generates a unique session token
// return: a random six digit token
async function getUniqueToken() {
  var token = Math.floor(100000 + Math.random() * 900000);
  // This is quite inefficient, but will suffice for a small scale demo
  while (!(await isTokenUnique(token))) {
    token = Math.floor(100000 + Math.random() * 900000);
  }
  return token
}

// Generates initial session data to upload to Firebase
// sessionToken: the token which we are generating data for
// tokenPair: is cooresponding token to the sessionToken
// isSender: true if sessionToken is for sender and false if it is for receiver
// return: data for given sessionToken
function getInitialSessionTokenData(sessionToken, tokenPair, isSender) {
  if (isSender) {
    return {
      isSender: true,
      uploadedImages: false,
      selectedCategories: false,
      tokenPair: tokenPair
    }
  }
  return {
    isSender: false,
    isVisible: false,
    tokenPair: tokenPair
  }
}

// Adds a sender and receiver session with unique 6-digit tokens.
// This addition occurs atomically, either both tokens are added or none are.
// return: the list [senderToken, receiverToken] on success and null on failure
async function createSession() {
  // NOTE: FOR TESTING WE ARE USING SET KEYS INSTEAD
  const senderToken = await getUniqueToken()
  const receiverToken = await getUniqueToken()

  // const senderToken = 111111
  // const receiverToken = 222222
  const sessionToken = `${senderToken}_${receiverToken}`;

  const senderTokenRef = db.collection('sessionTokens').doc(`${senderToken}`);
  const receiverTokenRef = db.collection('sessionTokens').doc(`${receiverToken}`);
  const sessionDataDocRef = db.collection('dataDocs').doc(sessionToken);
  const sessionFeedbackRef = db.collection('feedback').doc(sessionToken);

  const senderTokenData = getInitialSessionTokenData(senderToken, receiverToken, true);
  const receiverTokenData = getInitialSessionTokenData(receiverToken, senderToken, false);
  const sessionDataDocData = {numImgs: 0, categories: []}
  const sessionFeedbackData = {}

  try {
    await db.runTransaction(async (transaction) => {
      transaction.set(senderTokenRef, senderTokenData);
      transaction.set(receiverTokenRef, receiverTokenData);
      transaction.set(sessionDataDocRef, sessionDataDocData);
      transaction.set(sessionFeedbackRef, sessionFeedbackData);
    });
    console.log('Session data added to Firestore atomically:', senderTokenData, receiverTokenData);
  } catch (error) {
    console.error('Error adding session data to Firestore:', error);
    return null
  }

  return [senderToken, receiverToken]
}

// Gets the session data based on given session token
// sessionToken: the token to get the session data from
// return: session token data on success and null on failure
async function joinSession(sessionToken) {
  if (!sessionToken) {
    console.error('Session token is empty');
    return null;
  }
  const sessionTokenRef = db.collection('sessionTokens').doc(`${sessionToken}`);

  try {
    const doc = await sessionTokenRef.get();
    if (doc.exists) {
      const data = doc.data();
      console.log('Session token data:', data);
      return data
    } else {
      console.log('Session token not found in Firestore');
      return null;
    }
  } catch (error) {
    console.error('Error getting session token data from Firestore:', error);
    return null;
  }
}

// Adds the list of images and updates session state in Firebase
// senderToken: the session token of the sender
// receiverToken: the session token of the receiver
// imageList: a list of image files to upload
// return: true on success and false on failure
async function addImages(senderToken, receiverToken, imageList) {
  const sessionToken = `${senderToken}_${receiverToken}`;
  const storageRef = firebase.storage().ref();

  try {
    await Promise.all(imageList.map(async (imageFile, index) => {
      const imagePath = `${sessionToken}/img${index}`;
      const imageRef = storageRef.child(imagePath);
      await imageRef.put(imageFile);
    }));
    console.log('Images uploaded to Firebase Storage successfully.');
  } catch (error) {
    console.error('Error uploading images to Firebase Storage:', error);
    return false;
  }

  const senderTokenRef = db.collection('sessionTokens').doc(`${senderToken}`);
  const sessionDataDocRef = db.collection('dataDocs').doc(sessionToken);

  const senderTokenData = {uploadedImages: true}
  const sessionDataDocData = {numImgs: imageList.length}

  try {
    await db.runTransaction(async (transaction) => {
      transaction.update(senderTokenRef, senderTokenData);
      transaction.update(sessionDataDocRef, sessionDataDocData);
    });
    console.log('Session state updated in Firestore successfully.');
    return true;
  } catch (error) {
    console.error('Error updating session state Firestore: ', error);
    return false;
  }
}

// Gets the list of images urls from the current session in Firebase
// senderToken: the session token of the sender
// receiverToken: the session token of the receiver
// return: a list of image urls on success and null on failure
async function getImages(senderToken, receiverToken) {
  const sessionToken = `${senderToken}_${receiverToken}`;
  const sessionDataDocRef = db.collection('dataDocs').doc(sessionToken);
  const storageRef = firebase.storage().ref();
  const imageList = [];

  try {
    const doc = await sessionDataDocRef.get();
    if (!doc.exists) {
      console.error('Document does not exist');
      return null;
    }
    
    const numImgs = doc.data().numImgs;
    for (let i = 0; i < numImgs; i++) {
      const imagePath = `${sessionToken}/img${i}`;
      const imageRef = storageRef.child(imagePath);
      const imageUrl = await imageRef.getDownloadURL();
      imageList.push(imageUrl);
    }

    console.log('Images retrieved from Firebase Storage successfully:', imageList);
    return imageList;
  } catch (error) {
    console.error('Error retrieving images from Firebase Storage:', error);
    return null;
  }
}

// Adds the list of categories and updates session state in Firebase
// senderToken: the session token of the sender
// receiverToken: the session token of the receiver
// categoryList: a list of strings with each representing a category name
// return: true on success and false on failure
async function addCategories(senderToken, receiverToken, categoryList) {
  const sessionToken = `${senderToken}_${receiverToken}`;

  const senderTokenRef = db.collection('sessionTokens').doc(`${senderToken}`);
  const receiverTokenRef = db.collection('sessionTokens').doc(`${receiverToken}`);
  const sessionDataDocRef = db.collection('dataDocs').doc(sessionToken);

  const senderTokenData = {selectedCategories: true}
  const receiverTokenData = {isVisible: true}
  const sessionDataDocData = {categories: categoryList}

  try {
    await db.runTransaction(async (transaction) => {
      transaction.update(senderTokenRef, senderTokenData);
      transaction.update(receiverTokenRef, receiverTokenData);
      transaction.update(sessionDataDocRef, sessionDataDocData);
    });
    console.log('Categories added to Firestore successfully');
    return true;
  } catch (error) {
    console.error('Error adding categories to Firestore: ', error);
    return false;
  }
}

// Gets the list of categories from the current session in Firebase
// senderToken: the session token of the sender
// receiverToken: the session token of the receiver
// return: a list of strings with each representing a category name on success and null on failure
async function getCategories(senderToken, receiverToken) {
  const sessionToken = `${senderToken}_${receiverToken}`;
  const sessionDataDocRef = db.collection('dataDocs').doc(sessionToken);

  try {
    const doc = await sessionDataDocRef.get();
    if (doc.exists) {
      const categories = doc.data().categories;
      console.log('Categories retrieved from Firestore:', categories);
      return categories;
    } else {
      console.log('No categories found in Firestore');
      return null;
    }
  } catch (error) {
    console.error('Error getting categories from Firestore:', error);
    return null;
  }
}


// Adds the feedback for the image to the current session in Firebase
// senderToken: the session token of the sender
// receiverToken: the session token of the receiver
// imgIndex: the index of the image being given feedback
// x: the x-coordinate of the dot as an integer
// y: the y-coordinate of the dot as an integer
// name: the name of the critiquer as a string
// element: the focus/subject of the feedback as a string
// description: description of the element as a string
// effect: the effect the properties of the element has on the image as a string
// sentiment: true if feedback is positive and false if feedback is negative
// category: the index of the category the feedback is related to as an integer
// return: true on success and false on failure
async function addFeedback(senderToken, receiverToken, imgIndex, x, y, name, element, description, effect, sentiment, category) {
  const sessionToken = `${senderToken}_${receiverToken}`;
  const sessionFeedbackRef = db.collection('feedback').doc(sessionToken);

  try {
    const sessionFeedbackData = (await sessionFeedbackRef.get()).data();
    const imgFeedbackData = sessionFeedbackData[`img${imgIndex}`] || { numDots: 0 };

    const dotData = {
      x: x,
      y: y,
      name: name,
      element: element,
      description: description,
      effect: effect,
      sentiment: sentiment,
      category: category
    }

    imgFeedbackData[`dot${imgFeedbackData.numDots}`] = dotData;
    imgFeedbackData.numDots++;

    sessionFeedbackData[`img${imgIndex}`] = imgFeedbackData;
    await sessionFeedbackRef.update(sessionFeedbackData);

    console.log('Feedback added to Firestore successfully');
    return true;
  } catch (error) {
    console.error('Error adding feedback to Firestore:', error);
    return false;
  }
}

// Gets the feedback for all images from the current session in Firebase
// senderToken: the session token of the sender
// receiverToken: the session token of the receiver
// return: a list of dot objects on success and null on failure
async function getFeedback(senderToken, receiverToken) {
  const sessionToken = `${senderToken}_${receiverToken}`;
  const imageDocRef = db.collection('feedback').doc(sessionToken);

  try {
    const doc = await imageDocRef.get();
    if (!doc.exists) {
      console.error('Document does not exist');
      return null;
    }

    console.log('Feedback retrieved from Firestore:', doc.data());
    return doc.data();

    // const imgData = doc.data()[`img${imgIndex}`];
    // if (!imgData || imgData.numDots === 0) {
    //   console.log(`No dots found for image index ${imgIndex}`);
    //   return [];
    // }

    // const dots = [];
    // for (let i = 0; i < imgData.numDots; i++) {
    //   const dotKey = `dot${i}`;
    //   const dotObject = imgData[dotKey];
    //   if (dotObject) {
    //     dots.push(dotObject);
    //   } else {
    //     console.error(`Dot object ${dotKey} not found in image data`);
    //   }
    // }

    // console.log('Feedback dots retrieved from Firestore:', dots);
    // return dots;
  } catch (error) {
    console.error('Error retrieving feedback dots from Firestore:', error);
    return null;
  }
}


export { createSession, joinSession, addImages, getImages, addCategories, getCategories, addFeedback, getFeedback }