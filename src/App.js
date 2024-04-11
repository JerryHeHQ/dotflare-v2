import React, { useState } from 'react';
import './App.css';
import HomeScreen from './components/Screens/0_HomeScreen/HomeScreen'
import UploadScreen from './components/Screens/1_UploadScreen/UploadScreen'
import CategoryScreen from './components/Screens/2_CategoryScreen/CategoryScreen';
import ViewScreen from './components/Screens/3_ViewScreen/ViewScreen';
import FeedbackScreen from './components/Screens/4_FeedbackScreen/FeedbackScreen';
import ResultsScreen from './components/Screens/5_ResultsScreen/ResultsScreen';
import ProgressNavigation from './components/Common/NavigationBar/NavigationBar.js';

import 'bootstrap/dist/css/bootstrap.min.css';

// This is imported for testing purposes
import { createSession, joinSession, addImages, getImages, addCategories, getCategories, addFeedback, getFeedback } from "./backend/FirebaseAPICalls/FirebaseAPI"
import { toBeEmpty } from '@testing-library/jest-dom/dist/matchers.js';
import { set } from 'firebase/database';


/**
 * Sender Interaction Flow
 * 
 *  HomeScreen
 *    Create new session tokens
 *      Call FirebaseAPI to create session and return session tokens
 *      FirebaseAPI should initalize all data structures in the cloud
 *    Input sender session token into text box
 *    When the enter button is pressed
 *      Call FirebaseAPI to join session based on session token
 *      FirebaseAPI should return tokenInfo which contains
 *        isSender: true
 *        tokenPair: <insert cooresponding receiver token>
 *        uploadedImages: false
 *        selectedCategories: false
 *      Update all global state for the HomeScreen
 *    Afterwards, navigate to the next screen
 *      1_UploadScreen if uploadedImages == false
 *      2_CategoryScreen if selectedCategories == false
 *      3_ViewScreen otherwise
 * 
 *  UploadScreen
 *    When the add image button is pressed
 *      Open up a file explorer
 *      Allow user to selected files
 *      Check that the files are of correct type (e.g., '*.png', '*.jpg', etc.)
 *        Either only allow correct file types to be chosen, or if an incorrect
 *        file type is chosen, display an error message and discard all user
 *        input (i.e., do not save any files the user selected to states)
 *      If a correct file is chosen, add the File object to a private state
 *        Grid of images should update according to private state
 *    When "-" button on image is pressed
 *      Remove image from private state
 *        Grid of images should update according to private state
 *    Once the user finishes selecting images, they press the next button
 *      Insert a pop-up message which makes them confirm their action
 *      Show a message which states something similar to "you cannot change the
 *      images you choose once you confirm".
 *    If user backs out of confirm
 *      Hide the pop-up message
 *      Don't do anything else
 *      User should still be able to add and delete images
 *    If user presses confirm
 *      Call FirebaseAPI to upload images
 *      Do not move to the next screen until call is successful
 *      If call is not successful, show an error message
 *      If call is successful, navigate to the next screen
 *        2_CategoryScreen
 *
 *  CategoryScreen
 *    The list of possible categories should be stored in a private state str[]
 *    The list of selected categories should be stored in a private state str[]
 *    Allow user to selected from default categories
 *      Display categories as a CategoryCheckbox component
 *    When the add category button is pressed
 *      If textbox is empty, display an error message
 *      Otherwise, add new category to the list of possible categories
 *      Grid of categories should update according to private state
 *    When a category checkbox is pressed
 *      If category checkbox was not selected
 *        Show category checkbox as selected
 *        Add to list of selected categories
 *      If category checkbox was selected
 *        Show category checkbox as not selected
 *        Remove from list of selected categories
 *    Once the user finishes selecting categories, they press the next button
 *      Insert a pop-up message which makes them confirm their action
 *      Show a message which states something similar to "you cannot change the
 *      categories you choose once you confirm".
 *    If user backs out of confirm
 *      Hide the pop-up message
 *      Don't do anything else
 *      User should still be able to add and selected categories
 *    If user presses confirm
 *      Call FirebaseAPI to upload categories
 *      Do not move to the next screen until call is successful
 *      If call is not successful, show an error message
 *      If call is successful, navigate to the next screen
 *        3_ViewScreen
 *    User should not be able to go back to the UploadScreen
 */

/**
 * Receiver Interaction Flow
 * 
 *  ViewScreen (Only change for sender is that they can't add feedback)
 *    On navigate, call FirebaseAPI to get images and feedback
 *      On success, update the global states images and dotFeedback
 *    By default, display the first image with the feedback dots
 *    If toggle dots is pressed, remove all dots on image
 *      Ensure that no dots can be pressed
 *    On retoggle dots, add all dots back to image
 *      Ensure that all dots can be pressed
 *    On image number selected
 *      Change position of image selector wheel
 *      Change image to the cooresponding number
 *      Change dots to the cooresponding image
 *    On dot pressed
 *      Add a visible border around the selected dot
 *      Show feedback below the image selected and dot visiblity toggle
 *    On another dot pressed
 *      Remove old dot border
 *      Add a visible border around the newly selected dot
 *      Remove old dot feedback
 *      Show new dot feedback below the image selected and dot visiblity toggle
 *    On image pressed (only for receiver)
 *      Store the clicked position in the global states clickPosX and clickPosY
 *        clickPosX should be the % horizontal of where the image was pressed
 *        clickPosY should be the % vertical of where the image was pressed
 *      Examples for (clickPosX, clickPosY)
 *        (0%   ,   0%) : user clicked in the top left of the image
 *        (100% ,   0%) : user clicked in the top right of the image
 *        (100% , 100%) : user clicked in the bottom right of the image
 *        (0%   , 100%) : user clicked in the bottom left of the image
 *        (50%  ,  50%) : user clicked in the center of the image
 *        Note that this is also how the placement of the dots on the image
 *        will be calculated.
 *      Navigate to 4_FeedbackScreen
 *    If the next button is pressed
 *      Navigate to 5_ResultsScreen
 *    (For sender only) User should not be able to go back to the CategoryScreen
 * 
 *  FeedbackScreen
 *    Allow users to entry text, select sentiment, and only select one category
 *    Save user input in the global states
 *    If back button is pressed
 *      Navigate to 3_ViewScreen
 *    If next/submit button is pressed
 *      Check that all fields are filled out
 *        Show error message if not
 *      Call FirebaseAPI to upload feedback
 *      If call is not successful, show an error message
 *      If call is successful, navigate back to 3_ViewScreen
 *    If time allows
 *      Add ability to clear all fields
 *        Make sure to add a user confirmation pop-up
 *      Add an ok animation before navigating back to 3_ViewScreen when the
 *      feedback is submitted
 * 
 *  ResultsScreen
 *    Same layout as ViewScreen (including image selector and toggle dots)
 *    but with graph at bottom
 *    When dot is pressed, add a visible border around all dots of the same
 *    category & sentiement and the part of the graph cooresponding to the same
 *    category & sentiement.
 *    When a part of the graph is pressed, add a visible border around that part
 *    of the graph and a visible border around all dots of the same
 *    category & sentiement.
 *    On image number selected
 *      Change position of image selector wheel
 *      Change image to the cooresponding number
 *      Change dots to the cooresponding image
 *      Change graph to the cooresponding image
 *    If the back button is pressed
 *      Navigate to 3_ViewScreen
 *    If the next button is pressed
 *      Display a confimation message that user will be returned to the
 *      0_HomeScreen. If accepted
 *        Navigate to 0_HomeScreen
 *      Otherwise, ignore the next button press
 *    
 */


function App() {
  // Sender Screens: 0 1 2 3 5
  // Receiver Screens: 0 3 4 5
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [currentNavStep, setCurrentNavStep] = useState(0)

  // Set on HomeScreen, can be used anywhere
  const [tokenInfo, setTokenInfo] = useState();
  const [senderToken, setSenderToken] = useState('------');
  const [receiverToken, setReceiverToken] = useState('------');
  const [isSender, setIsSender] = useState();
  // No global state for UploadScreen, use FirebaseAPI or private state
  // No global state for CategoryScreen, use FirebaseAPI or private state
  // Set on ViewScreen, used in FeedbackScreen
  const [clickPosX, setClickPosX] = useState();
  const [clickPosY, setClickPosY] = useState();
  const [categories, setCategories] = useState();
  // Set on FeedbackScreen, used in FeedbackScreen
  const [imageIndex, setImageIndex] = useState(0);
  const [critiquerName, setCritiquerName] = useState();
  const [formalElement, setFormalElement] = useState();
  const [description, setDescription] = useState();
  const [effect, setEffect] = useState();
  const [sentiment, setSentiment] = useState();
  const [categoryIndex, setCategoryIndex] = useState();
  // No global state for ResultsScreen, use FirebaseAPI or private state

  // Local storage of Firebase data
  const [images, setImages] = useState();
  const [dotFeedback, setDotFeedback] = useState();

  const fetchImages = async () => {
    setImages(await getImages(senderToken, receiverToken));
  }

  const fetchDotFeedback = async () => {
    setDotFeedback(await getFeedback(senderToken, receiverToken));
  }

  const fetchCategories = async () => {
    setCategories(await getCategories(senderToken, receiverToken))
  }

  const setSessionTokens = async () => {
    const tokens = await createSession();
    setSenderToken(tokens[0]);
    setReceiverToken(tokens[1]);
  }

  const enterSession = async (sessionToken) => {
    const tokenData = await joinSession(sessionToken);
    if (tokenData == null) {
      return;
    }

    setTokenInfo(tokenData)
    setIsSender(tokenData.isSender)
    if (tokenData.isSender) {
      setSenderToken(sessionToken)
      setReceiverToken(tokenData.tokenPair)
    } else {
      if (tokenData.isVisible == true) {
        setSenderToken(tokenData.tokenPair)
      setReceiverToken(sessionToken)
      }
    }

    if (tokenData.isSender) {
      if (tokenData.uploadedImages == false) {
        navigateToScreen(1, 0)
      } else if (tokenData.selectedCategories == false) {
        navigateToScreen(2, 1)
      } else {
        navigateToScreen(3, 2)
      }
    } else {
      if (tokenData.isVisible == true) {
        navigateToScreen(3, 0)
      }
    }
  }

  const exitSession = async () => {
    setTokenInfo()
    setSenderToken('------');
    setReceiverToken('------');
    setIsSender();
    setClickPosX();
    setClickPosY();
    setCategories();
    setCritiquerName();
    setFormalElement();
    setDescription();
    setEffect();
    setSentiment();
    setCategoryIndex();
    setImages();
    setDotFeedback();
    navigateToScreen(0, 0);
    setImageIndex(0);
  }
  
  const navigateToScreen = (screenIndex, navStep) => {
    setCurrentScreenIndex(screenIndex);
    setCurrentNavStep(navStep);
  };

  const updateUserClickPosition = (xPercent, yPercent) => {
    setClickPosX(xPercent);
    setClickPosY(yPercent);
  }
  
  const senderSteps = ['Upload', 'Category', 'View', 'Results'];
  const receiverSteps = ['View', 'Feedback', 'Results'];

  const steps = isSender ? senderSteps : receiverSteps;

  const renderScreen = () => {
    switch (currentScreenIndex) {
      case 0:
        return <HomeScreen 
        navigateToScreen={navigateToScreen} 
        senderToken={senderToken} 
        receiverToken={receiverToken} 
        getSessionTokens={setSessionTokens} 
        enterSession={enterSession}/>;
      case 1:
        return <UploadScreen 
        navigateToScreen={navigateToScreen} 
        exitSession={exitSession} 
        senderToken={senderToken} 
        receiverToken={receiverToken} />;
      case 2:
        return <CategoryScreen 
        navigateToScreen={navigateToScreen} 
        exitSession={exitSession}
        senderToken={senderToken} 
        receiverToken={receiverToken} />;
      case 3:
        return <ViewScreen 
        navigateToScreen={navigateToScreen} 
        exitSession={exitSession} 
        isSender={isSender}
        setFeedbackImageIndex={setImageIndex}
        images={images}
        fetchImages={fetchImages}
        dotFeedback={dotFeedback}
        fetchDotFeedback={fetchDotFeedback}
        categories={categories}
        fetchCategories={fetchCategories}
        clickPosX={clickPosX}
        clickPosY={clickPosY}
        updateUserClickPosition={updateUserClickPosition}/>;
      case 4:
        return <FeedbackScreen 
        navigateToScreen={navigateToScreen} 
        senderToken={senderToken}
        receiverToken={receiverToken}
        imageIndex={imageIndex}
        clickPosX={clickPosX}
        clickPosY={clickPosY}
        updateUserClickPosition={updateUserClickPosition}
        critiquerName={critiquerName}
        setCritiquerName={setCritiquerName} 
        formalElement={formalElement}
        setFormalElement={setFormalElement}
        description={description}
        setDescription={setDescription} 
        effect={effect}
        setEffect={setEffect} 
        sentiment={sentiment}
        setSentiment={setSentiment}
        categoryIndex={categoryIndex}
        setCategoryIndex={setCategoryIndex}
        categories={categories}/>;
      case 5:
        return <ResultsScreen 
        navigateToScreen={navigateToScreen} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ backgroundColor: 'rgb(30, 30, 30)' }}>
      {currentScreenIndex !== 0 && (
        <ProgressNavigation steps={steps} currentStep={currentNavStep} setCurrentStep={setCurrentScreenIndex} />
      )}

      {renderScreen()}
    </div>
  );
}

export default App;
