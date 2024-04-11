import React, { useEffect, useState } from 'react';
import { getImages, getFeedback } from '../../../backend/FirebaseAPICalls/FirebaseAPI';
import FeedbackImage from '../../Common/FeedbackImage/FeedbackImage';
import './ViewScreen.css';
import eye from '../../../images/eye-solid.svg';
import eyeSlash from '../../../images/eye-slash-solid.svg';
import help from '../../../images/circle-question-regular.svg';
import picture from '../../../images/picture.jpg';
import NavigationButton from '../../Common/NavigationButton/NavigationButton';
import FeedbackEntry from '../../Common/FeedbackEntry/FeedbackEntry';

function ViewScreen({ 
  navigateToScreen, 
  exitSession, 
  isSender, 
  setFeedbackImageIndex,
  images, 
  fetchImages, 
  dotFeedback, 
  fetchDotFeedback, 
  categories, 
  fetchCategories, 
  clickPosX, 
  clickPosY, 
  updateUserClickPosition }) {

  const onBackClick = () => {
    exitSession();
  }

  const onNextClick = async () => {
    if (isSender) {
      navigateToScreen(5, 3)
    } else {
      navigateToScreen(5, 2)
    }
  }

  useEffect(() => {
    fetchImages();
    fetchDotFeedback();
    fetchCategories();
  }, []);

  const [isVisible, setIsVisible] = useState(true);
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const generateInitialButtonsState = (count) => {
    const initialState = [];
    for (let i = 1; i <= count; i++) {
      initialState.push({ id: i, color: i === 1 ? '#BF8DFF' : '#555555' });
    }
    return initialState;
  };

  const [buttons, setButtons] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (images != null) {
      setButtons(generateInitialButtonsState(images.length))
    }
  }, [images])

  const changeImage = (id) => {
    const updatedButtons = buttons.map(button =>
      button.id === id ? { ...button, color: '#BF8DFF' } : { ...button, color: '#555555' }
    );
    setButtons(updatedButtons);
    setImageIndex(id - 1);
    setFeedbackImageIndex(id - 1);
    setActiveDotIndex(null);
    updateUserClickPosition(null, null);
  };

  const [activeDotIndex, setActiveDotIndex] = useState(null);

  const displayDotFeedback = (dotIndex) => {
    setActiveDotIndex(dotIndex);
  }

  return (
    <div className="view-screen">
      {images != null && dotFeedback != null ? 
      <FeedbackImage 
        navigateToScreen={navigateToScreen}
        isSender={isSender}
        image={images[imageIndex]} 
        feedback={dotFeedback[`img${imageIndex}`]}
        displayDotFeedback={displayDotFeedback}
        isVisible={isVisible}
        clickPosX={clickPosX}
        clickPosY={clickPosY}
        updateUserClickPosition={updateUserClickPosition}/>
      : 
      null
      }

      <div className='hint'>
        {isSender ? 'Click on the dots to view feedback.' : 'Click on the dots/image to view/add feedback.'}
      </div>
      <div className="button-row">
        <div className="icons">
          <img src={help} alt="Help" />
        </div>
        <div>
          {buttons.map(button => (
            <button
              key={button.id}
              style={{ color: button.color,backgroundColor: 'transparent' }}
              onClick={() => changeImage(button.id)}
            >
              {button.id}
            </button>
          ))}
        </div>
        <div className="icons" onClick={toggleVisibility}>
            <img src={isVisible ? eye : eyeSlash} alt="Toggle Eye" />
        </div>
      </div>
      {activeDotIndex != null && categories != null
      ?
      <div>
        <FeedbackEntry label="Sentiment" text={dotFeedback[`img${imageIndex}`][`dot${activeDotIndex}`]['sentiment'] ? 'Positive' : 'Negative'} />
        <FeedbackEntry label="Category" text={categories[dotFeedback[`img${imageIndex}`][`dot${activeDotIndex}`]['category']]} />
        <FeedbackEntry label="Critiquer Name" text={dotFeedback[`img${imageIndex}`][`dot${activeDotIndex}`]['name']} />
        <FeedbackEntry label="Formal Element" text={dotFeedback[`img${imageIndex}`][`dot${activeDotIndex}`]['element']} />
        <FeedbackEntry label="Description" text={dotFeedback[`img${imageIndex}`][`dot${activeDotIndex}`]['description']} />
        <FeedbackEntry label="Effect" text={dotFeedback[`img${imageIndex}`][`dot${activeDotIndex}`]['effect']} />
      </div>
      :
      null}

      {clickPosX != null && clickPosY != null
      ?
      <button className='feedback-button' onClick={() => {navigateToScreen(4, 1);}}>
        Proceed To Feedback
      </button>
      :
      null
      }

      
      
      <NavigationButton backVisibility={true} nextVisibility={true} backText={"Home"} nextText={"Next"} backFunction={onBackClick} nextFunction={onNextClick}/>
    </div>
  );

}

export default ViewScreen;
