import dialogueStore from '../../../store/dialogueStore';
import { useState } from 'react';
import TextBarDialogue from '../../lib/ui/TextBarDialogue';

function DeleteDialogue({ calID }) {
    const closeDialogue = dialogueStore((store) => store.closePanel)

    const [displayError, setDisplayError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('some error message')
    const confirmationString = Math.random().toString(36).slice(2)

    return (
        <TextBarDialogue
            buttonText='Delete'
            titleText='Delete Calendar'
            description={`Type in the phrase ${confirmationString} to delete`}
            displayError={displayError}
            errorMessage={errorMessage}
            onClickPassthrough={async ({ event, textBarValue }) => {
                if (textBarValue !== confirmationString) {
                    setErrorMessage('Confirmation code incorrect')
                    setDisplayError(true)
                    return
                }

                const req = await fetch(`${process.env.API_URL}/cal/${calID}`, {
                    credentials: 'include', method: 'DELETE', headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const resp = await req.json()
                if (resp.Status === 'ok') {
                    closeDialogue()
                }
                else {
                    setErrorMessage(resp.error)
                    setDisplayError(true)
                }
            }} />

    )
}

export default DeleteDialogue;