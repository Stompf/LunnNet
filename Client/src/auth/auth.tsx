import * as React from 'react';
import Auth0Lock from 'auth0-lock';
import { Button } from 'material-ui';

interface AuthProps {}
interface AuthState {
    loggedIn: boolean;
}

const AUTH0_CLIENT_ID = '4jzx2gzFUTgxbTsIKzfQ8k1P3w7RiEU6';

export class Auth extends React.Component<AuthProps, AuthState> {
    private lock: typeof Auth0Lock;

    constructor(props: AuthProps) {
        super(props);
        this.state = {
            loggedIn: false
        };

        this.lock = new Auth0Lock(AUTH0_CLIENT_ID, 'lunne.eu.auth0.com', {
            auth: {
                redirect: false,
                responseType: 'token',
                params: {
                    scope: 'openid email profile'
                }
            }
        });

        this.lock.checkSession({}, (error, authResult) => {
            if (!error && authResult) {
                // user has an active session, so we can use the accessToken directly.
                this.getUserInfo(authResult.accessToken);
            }
        });

        this.lock.on('authenticated', authResult => {
            // Use the token in authResult to getUserInfo() and save it to localStorage
            this.getUserInfo(authResult.accessToken);
        });
    }

    render() {
        return this.state.loggedIn ? (
            <Button color="inherit" onClick={() => this.logout()}>
                Logout
            </Button>
        ) : (
            <Button color="inherit" onClick={() => this.login()}>
                Login
            </Button>
        );
    }

    private logout() {
        this.lock.logout({
            returnTo: window.location.href,
            clientID: AUTH0_CLIENT_ID
        });
    }

    private login() {
        this.lock.show();
    }

    private getUserInfo(accessToken: string) {
        this.lock.getUserInfo(accessToken, (error, profile) => {
            if (error) {
                console.log('getUserInfo error', error);
                return;
            }

            console.log(profile.nickname);

            console.log(accessToken);
            console.log(JSON.stringify(profile));

            this.lock.hide();
            this.setState({ loggedIn: true });
        });
    }
}
