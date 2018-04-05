import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    Button,
    MenuItem,
    ClickAwayListener,
    Grow,
    Paper,
    MenuList,
    WithStyles,
    Theme
} from 'material-ui';
import { Manager, Target, Popper } from 'react-popper';
import { withStyles } from 'material-ui/styles';
import * as classNames from 'classnames';

interface AirHockeyProps {}

interface AirHockeyState {
    open: boolean;
}

const styles = (theme: Theme) => ({
    root: {
        display: 'flex'
    },
    paper: {
        marginRight: theme.spacing.unit * 2
    },
    popperClose: {
        pointerEvents: 'none'
    }
});

class AirHockeyMainMenu extends React.Component<
    AirHockeyProps & WithStyles<'root' | 'paper' | 'popperClose'>,
    AirHockeyState
> {
    private timeout: number = 0;

    state = {
        open: false
    };

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    render() {
        const LocalLink = (props: any) => <Link to="/air-hockey/local" {...props} />;
        const NetworkLink = (props: any) => <Link to="/air-hockey/network" {...props} />;
        const { open } = this.state;
        const { classes } = this.props;

        return (
            <Manager>
                <Target>
                    <Button
                        color="inherit"
                        aria-owns={open ? 'menu-list' : undefined}
                        aria-haspopup="true"
                        onClick={this.handleClick}
                    >
                        Air hockey
                    </Button>
                </Target>
                <Popper
                    placement="bottom-start"
                    eventsEnabled={open}
                    className={classNames({ [classes.popperClose]: !open })}
                >
                    <ClickAwayListener onClickAway={this.handleClose}>
                        <Grow in={open}>
                            <Paper id="menu-list" style={{ transformOrigin: '0 0 0' }}>
                                <MenuList role="menu">
                                    <MenuItem component={LocalLink} onClick={this.handleClose}>
                                        Local play
                                    </MenuItem>
                                    <MenuItem component={NetworkLink} onClick={this.handleClose}>
                                        Network play
                                    </MenuItem>
                                </MenuList>
                            </Paper>
                        </Grow>
                    </ClickAwayListener>
                </Popper>
            </Manager>
        );
    }

    private handleClick = () => {
        this.setState({ open: !this.state.open });
    };

    private handleClose = () => {
        if (!this.state.open) {
            return;
        }

        // setTimeout to ensure a close event comes after a target click event
        this.timeout = setTimeout(() => {
            this.setState({ open: false });
        });
    };
}

export default withStyles(styles)(AirHockeyMainMenu);
