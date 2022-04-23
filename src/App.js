import 'regenerator-runtime/runtime';
import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import Form from './components/Form';
import SignIn from './components/SignIn';
import Messages from './components/Messages';
import guestBookImage from './assets/guestbook.png';


const SUGGESTED_DONATION = '0';
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const App = ({provider, currentUser, selector}) => {
  const [messages, setMessages] = useState([]);

  const getMessages = async () => {
    let result = await provider.query({
      request_type: "call_function",
      account_id: selector.getContractId(),
      method_name: "getMessages",
      args_base64: "",
      finality: "optimistic",
    })
    let messages = JSON.parse(Buffer.from(result.result).toString())
    setMessages(messages);
    return messages;
  }
  useEffect(async () => {
    await getMessages();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    const {fieldset, message, donation} = e.target.elements;

    fieldset.disabled = true;

    selector.signAndSendTransaction({
        signerId: currentUser.accountId,
        // receiverId: nearConfig.contractName,
        actions:[
          {
            type: "FunctionCall",
            params: {
              methodName: "addMessage",
              args: {text: message.value},
              gas: BOATLOAD_OF_GAS,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              deposit: Big(donation.value || '0').times(10 ** 24).toFixed(),
            },
          },
        ]
      })
      .catch((err) => {
        // eslint-disable-next-line no-undef
        alert("Failed to add message");
        console.log("Failed to add message");
        throw err;
      })
      .then(async () => {
        return await getMessages()
          .then((nextMessages) => {
            setMessages(nextMessages);
            message.value = "";
            donation.value = SUGGESTED_DONATION;
            fieldset.disabled = false;
            message.focus();
          })
          .catch((err) => {
            // eslint-disable-next-line no-undef
            alert("Failed to refresh messages");
            console.log("Failed to refresh messages");

            throw err;
          });
      })
      .catch((err) => {
        console.error(err);
        fieldset.disabled = false;
      });

  };

  const signIn = () => {
    // eslint-disable-next-line no-undef
    selector.show();
  };

  const signOut = async () => {
    await selector.signOut().then(() => {
      // eslint-disable-next-line no-undef
      document.location.reload();
    }).catch((err) => {
      // eslint-disable-next-line no-undef
      alert(err);
    });
  };

  return (
    <main className="p-3">
      <div className="row">
        <div className="card p-0">
          <div className=""><img src={guestBookImage} className="card-img-top"/></div>
          <div className="card-body">
            <h5 className="card-title">NEAR Guest Book</h5>
            {currentUser
              ? <Form onSubmit={onSubmit} currentUser={currentUser}/>
              : <SignIn/>
            }
            {!!currentUser && !!messages.length && <Messages messages={messages}/>}
            {currentUser
              ? <button onClick={signOut} className="btn btn-danger float-end">Log out</button>
              : <button onClick={signIn} className="btn btn-primary">Log in</button>
            }
          </div>
        </div>
      </div>
    </main>

  );
};

App.propTypes = {
  provider: PropTypes.shape().isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  selector: PropTypes.shape().isRequired
};

export default App;
