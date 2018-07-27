import * as React from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Theme,
    WithStyles,
    withStyles,
    Button,
    Toolbar,
    Typography,
    Paper,
    IconButton,
    Icon
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';

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
        joinCell: {
            width: 50
        }
    } as StyleRules);

let id = 0;
function createData(name: string, playerCount: string, status: string) {
    id += 1;
    return { id, name, playerCount, status };
}

const data = [
    createData(`Server 1`, '2/4', 'Waiting'),
    createData('Server 2', '1/4', 'Playing'),
    createData('Server 3', '2/4', 'Waiting')
];

class ServerList extends React.Component<WithStyles> {
    render() {
        const { classes } = this.props;

        return (
            <Paper className={classes.table}>
                <Toolbar>
                    <Typography variant="title" id="tableTitle">
                        Server List
                    </Typography>
                    <IconButton
                        color="inherit"
                        className={classes.button}
                        aria-label="Add an alarm"
                    >
                        <Icon>refresh</Icon>
                    </IconButton>
                </Toolbar>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Server</TableCell>
                            <TableCell>Players</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell className={classes.joinCell} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map(n => {
                            return (
                                <TableRow key={n.id}>
                                    <TableCell component="th" scope="row">
                                        {n.name}
                                    </TableCell>
                                    <TableCell>{n.playerCount}</TableCell>
                                    <TableCell>{n.status}</TableCell>
                                    <TableCell className={classes.joinCell}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            className={classes.button}
                                        >
                                            JOIN
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

export default withStyles(styles)(ServerList);
