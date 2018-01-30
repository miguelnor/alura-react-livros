import Pubsub from 'pubsub-js';

export default class ErrorHandler {
    publishErrors(errorStack) {
        errorStack.errors.forEach(error => {
            Pubsub.publish('validation-error', error);
        });
    }
}