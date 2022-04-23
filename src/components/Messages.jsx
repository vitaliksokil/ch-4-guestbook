import React from 'react';
import PropTypes from 'prop-types';

export default function Messages({messages}) {
  const getDate = (timestamp) => {
    let date = new Date;
    date.setTime(timestamp.substring(0,13));
    const currentDayOfMonth = date.getDate();
    const currentMonth = date.getMonth(); // Be careful! January is 0, not 1
    const currentYear = date.getFullYear();
    const hours = date.getHours();
    // Minutes part from the timestamp
    const minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    const seconds = "0" + date.getSeconds();

    const dateString = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear + " " + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return dateString;
  };
  return (
    <>
      <h2>Messages</h2>
      {messages.map((message, i) =>
        <div key={i}>
          <div className="card" className={message.premium ? 'is-premium' : ''}>
            <div className="card-body p-0">
              <h6 className="card-title">{message.sender}</h6>
              <p className="card-text">{message.text}</p>
              <p className="card-text"><small className="text-muted">{getDate(message.time)}</small></p>
            </div>
          </div>
          <hr/>
        </div>
      )}
    </>
  );
}

Messages.propTypes = {
  messages: PropTypes.array
};
