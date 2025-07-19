import { useImperativeHandle, useState } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css'; // Import the default styles
import './style.css';

const MyPopup = ({
  getKey=()=>{},
  ref
}) => {
  const [apiKey, setApiKey] = useState('');
  const [open, setOpen] = useState(false);

  const togglePopup = (value = false) => {
    setOpen(value);
  };

  const submitForm = (e) => {
    e.preventDefault();
    togglePopup();
    getKey(apiKey);
  };

  useImperativeHandle(ref, () => ({
    togglePopup
  }));
  return (
    <Popup
      open={open}
      position="right center"
      closeOnDocumentClick={false}
    >
      <form className="modal" onSubmit={submitForm}>
        {/* <button className="close" onClick={() => { togglePopup(false) }}>
          &times;
        </button> */}
        <div className="header"> Enter OpenAI API Key to chat with Bot</div>
        <div className="content">
          <label className="block font-bold">
            <span className="text-gray-700">Press OpenAI API Key</span>
          </label>
          <input type="text"
            name='openai_api_key'
            className="mt-1 p-2 w-full block border rounded-md focus:outline-none focus:border-blue-500"
            onChange={(e) => { setApiKey(e.target.value) }} required
          />
        </div>
        <div className="actions">
          <button
            className="button"
            type="submit"
          >
            Send API key
          </button>
        </div>
      </form>
    </Popup>
  );
};

export default MyPopup;
