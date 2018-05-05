import * as React from 'react';
import Auth0Lock from 'auth0-lock';
import {
    Button,
    Avatar,
    Grid,
    withStyles,
    WithStyles,
    ClickAwayListener,
    Grow,
    Paper,
    MenuList,
    MenuItem,
    IconButton,
    Menu
} from 'material-ui';
import { StyleRules, Theme } from 'material-ui/styles';
import { AuthConfig } from 'src/auth/auth-config';
import { Manager, Target, Popper } from 'react-popper';
import classNames = require('classnames');

interface AuthProps {}
interface AuthState {
    anchorEl: any | null;
    loggedIn: boolean;
    profileSrc: string;
}

const styles = (theme: Theme) =>
    ({
        iconButton: {
            marginRight: theme.spacing.unit * 2,
            width: 36,
            height: 36
        },
        avatar: {
            width: 36,
            height: 36
        }
    } as StyleRules);

class Auth extends React.Component<AuthProps & WithStyles, AuthState> {
    private lock: typeof Auth0Lock;
    private timeout: number = 0;

    constructor(props: AuthProps & WithStyles) {
        super(props);
        this.state = {
            loggedIn: false,
            profileSrc: '',
            anchorEl: null
        };

        this.lock = new Auth0Lock(AuthConfig.clientId, AuthConfig.domain, {
            auth: {
                redirect: false,
                responseType: 'token',
                params: {
                    scope: AuthConfig.scope
                }
            }
        });

        this.lock.checkSession({ scope: AuthConfig.scope }, (error, authResult) => {
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
        const { anchorEl, loggedIn } = this.state;
        const open = Boolean(anchorEl);

        return loggedIn ? (
            <div>
                <IconButton
                    aria-owns={open ? 'menu-appbar' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleMenu}
                    color="inherit"
                    className={classes.iconButton}
                >
                    <Avatar className={classes.avatar} src={this.state.profileSrc} />
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}
                    open={open}
                    onClose={this.handleClose}
                >
                    <MenuItem onClick={this.logout}>Logout</MenuItem>
                </Menu>
            </div>
        ) : (
            <Button color="inherit" onClick={this.login}>
                Login
            </Button>
        );
    }

    private handleMenu = (event: any) => {
        this.setState({ anchorEl: event.currentTarget });
    };

    private handleClose = () => {
        this.setState({ anchorEl: null });
    };

    private logout = () => {
        this.handleClose();
        this.lock.logout({
            returnTo: window.location.href,
            clientID: AuthConfig.clientId
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
