import * as React from 'react';
import Auth0Lock from 'auth0-lock';
import { Button, Avatar, Grid, withStyles, WithStyles } from 'material-ui';
import { StyleRules } from 'material-ui/styles';

interface AuthProps {}
interface AuthState {
    loggedIn: boolean;
    profileSrc: string;
}

const AUTH0_CLIENT_ID = '4jzx2gzFUTgxbTsIKzfQ8k1P3w7RiEU6';
const AUTH0_SCOPE = 'openid email profile';

const styles: StyleRules = {
    avatar: {
        width: 36,
        height: 36
    }
};

class Auth extends React.Component<AuthProps & WithStyles, AuthState> {
    private lock: typeof Auth0Lock;

    constructor(props: AuthProps & WithStyles) {
        super(props);
        this.state = {
            loggedIn: false,
            profileSrc: ''
        };

        this.lock = new Auth0Lock(AUTH0_CLIENT_ID, 'lunne.eu.auth0.com', {
            auth: {
                redirect: false,
                responseType: 'token',
                params: {
                    scope: AUTH0_SCOPE
                }
            }
        });

        this.lock.checkSession({ scope: AUTH0_SCOPE }, (error, authResult) => {
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
        const { classes } = this.props;

        return this.state.loggedIn ? (
            <Grid container spacing={0}>
                <Grid item>
                    <Avatar className={classes.avatar} src={this.state.profileSrc} />
                </Grid>
                <Grid item>
                    <Button color="inherit" onClick={this.logout}>
                        Logout
                    </Button>
                </Grid>
            </Grid>
        ) : (
            <Button color="inherit" onClick={this.login}>
                Login
            </Button>
        );
    }

    private logout = () => {
        this.lock.logout({
            returnTo: window.location.href,
            clientID: AUTH0_CLIENT_ID
        });
    };

    private login = () => {
        this.lock.show();
    };

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
            this.setState({ loggedIn: true, profileSrc: profile.picture });
        });
    }
}

export default withStyles(styles)(Auth);
