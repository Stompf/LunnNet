import * as React from 'react';
import ServerList from './server-list';
import { Theme } from '@material-ui/core';
import { StyleRules, WithStyles, withStyles } from '@material-ui/core/styles';

const styles = (theme: Theme) =>
    ({
        root: {
            width: '100%',
            marginTop: theme.spacing.unit * 3,
            overflowX: 'auto'
        },
        button: {
            margin: theme.spacing.unit
        },
        table: {
            width: '40%'
        }
    } as StyleRules);

class AchtungLobby extends React.Component<WithStyles> {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <div className={classes.table}>
                    <ServerList />
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(AchtungLobby);
