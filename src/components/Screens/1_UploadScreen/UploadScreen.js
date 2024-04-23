import React, { useState } from 'react';
import './UploadScreen.css';
import plusIcon from '../../../images/plus-solid.svg';
import NavigationButton from '../../Common/NavigationButton/NavigationButton';
import { addImages } from '../../../backend/FirebaseAPICalls/FirebaseAPI';

function UploadScreen({navigateToScreen, exitSession, senderToken, receiverToken }) {
  // State to store uploaded pictures
  const [pictures, setPictures] = useState([]);

  // Function to handle picture upload
  const handlePictureUpload = (e) => {
    const newPictures = Array.from(e.target.files);
    setPictures([...pictures, ...newPictures]);
  };

  // Function to handle button click and trigger file input
  const handleAddButtonClick = () => {
    const fileInput = document.getElementById("upload-input");
    fileInput.click();
  };

  const onBackClick = () => {
    exitSession();
  }

  const onNextClick = async () => {
    await addImages(senderToken, receiverToken, pictures)
    navigateToScreen(2, 1)
  }

  return (
    <div className="upload-screen">
      <div className="picture-grid">
        {pictures.map((picture, index) => (
          <div className="picture-item" key={index}>
            <img src={URL.createObjectURL(picture)} alt={`Uploaded ${index}`} />
          </div>
        ))}
      </div>
      <button className="upload-button" onClick={handleAddButtonClick}>
        <img src={plusIcon} alt="Upload" />
      </button>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handlePictureUpload}
        style={{ display: 'none' }}
        id="upload-input"
      />
      <div className="bottom-bar"></div>
      <NavigationButton backVisibility={true} nextVisibility={pictures.length > 0} backText={"Home"} nextText={"Upload"} backFunction={onBackClick} nextFunction={onNextClick}/>
    </div>
  );
}

export default UploadScreen;
