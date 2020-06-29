import * as React from "react";
import {useState} from "react";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Tooltip from "@material-ui/core/Tooltip";
import TableBody from "@material-ui/core/TableBody";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {Link} from "react-router-dom";
import {useRouteMatch} from 'react-router';
import {Icon, IconButton, Snackbar} from "@material-ui/core";
import {AbTestModel} from "../../shared/models/AbTestModel";

const useStyles = makeStyles((theme: Theme) => createStyles({
  content: {
    padding: 0
  },
  button: {
    marginRight: theme.spacing(1)
  }
}));


export default function AbTestList (props: {tests: AbTestModel[], handleDelete}) {
  const {tests, handleDelete} = props;
  const classes = useStyles();
  const {path} = useRouteMatch();

  return (
    <Card>
      <CardContent className={classes.content}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Responses</TableCell>
              <TableCell sortDirection="desc">
                <Tooltip enterDelay={300} title="Sort">
                  <TableSortLabel active direction="desc">
                    Creation Date
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell/>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* TODO <TableCell colSpan={2}>Data Two Columns</TableCell>*/}
            {tests.map(test => <TableRow hover key={test._id.$oid}>
              <TableCell>{test.name}</TableCell>
              <TableCell>
                <Button to={{pathname: `${path}/${test._id.$oid}`, hash: "#responses"}} component={Link}
                        color="primary">{test.responses.length}</Button>
              </TableCell>
              <TableCell>
                {new Date(test.createdAt?.$date).toLocaleString()}
                {/*{moment(order.createdAt).format('DD/MM/YYYY')}*/}
              </TableCell>
              <TableCell>
                <IconButton className={classes.button} size="small" color="primary" component={Link}
                            to={`${path}/${test._id.$oid}`}><Icon>edit</Icon></IconButton>
                <ShareIconButton className={classes.button} url={`/task/ab-test/${test._id.$oid}`}/>
                <IconButton className={classes.button} size="small" color="default" onClick={() => handleDelete(test)}>
                  <Icon>delete</Icon></IconButton>
              </TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ShareIconButton(props) {
  const {url, ...rest} = props;
  const [open, setSnackbarOpen] = useState(false);

  const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    if (reason === 'clickaway') return
    setSnackbarOpen(false);
  };
  const handleShareClick = () => {
    navigator.clipboard.writeText(`http://localhost:3000${url}`)
      .then(() => setSnackbarOpen(true));
  }

  return (
    <React.Fragment>
      <IconButton {...rest} size="small" color="primary"
                  onClick={handleShareClick}><Icon>share</Icon></IconButton>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Copy the link to clipboard successfully"
        action={
          <React.Fragment>
            <Button size="small" color="secondary" component={Link}
                    to={url}>View</Button>

            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <Icon fontSize="small">cancel</Icon>
            </IconButton>
          </React.Fragment>
        }
      />
    </React.Fragment>
  )
}
