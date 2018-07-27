import * as React from 'react';
import Auth0Lock from 'auth0-lock';
import {
    Button,
    Avatar,
    withStyles,
    WithStyles,
    MenuItem,
    IconButton,
    Menu,
    Theme
} from '@material-ui/core';
import { AuthConfig } from 'src/auth/auth-config';
import { Auth0UserProfile } from 'auth0-js';
import { StyleRules } from '../../node_modules/@material-ui/core/styles';

interface AuthProps {}
interface AuthState {
    anchorEl: HTMLElement | undefined;
    profile: Auth0UserProfile | undefined;
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

    constructor(props: AuthProps & WithStyles) {
        super(props);
        this.state = {
            profile: undefined,
            anchorEl: undefined
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
        const { anchorEl, profile } = this.state;
        const open = Boolean(anchorEl);

        return profile ? (
            <div>
                <IconButton
                    aria-owns={open ? 'menu-appbar-auth' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleMenu}
                    color="inherit"
                    className={classes.iconButton}
                >
                    <Avatar className={classes.avatar} src={profile.picture} />
                </IconButton>
                <Menu
                    id="menu-appbar-auth"
                    anchorEl={anchorEl}
                    getContentAnchorEl={undefined}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
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

    private handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        this.setState({ anchorEl: event.currentTarget });
    };

    private handleClose = () => {
        this.setState({ anchorEl: undefined });
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

            this.lock.hide();
            this.setState({ profile: profile });
        });
    }
}

export default withStyles(styles)(Auth);
