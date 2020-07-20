import React, {useContext, useEffect, useState} from "react";
import {Grid, Icon, IconButton, Snackbar} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {Link, useHistory, useLocation} from "react-router-dom";
import SearchInput from "../../shared/components/SearchInput";
import {useRouteMatch} from "react-router";
import Axios from "axios";
import Loading from "../../layouts/components/Loading";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Tooltip from "@material-ui/core/Tooltip";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TableBody from "@material-ui/core/TableBody";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {BasicTestModel} from "../../shared/models/BasicTestModel";
import {getCurrentHost} from "../../shared/ReactTools";
import {TestUrl} from "../../shared/models/EnumsAndTypes";
import {GlobalSnackbar} from "../../shared/ReactContexts";

const useStyles = makeStyles((theme: Theme) => createStyles({
  content: {
    padding: 0
  },
  button: {
    marginRight: theme.spacing(1)
  }
}));

export default function TestListView({testUrl}: { testUrl: TestUrl }) {
  const {path} = useRouteMatch();
  const classes = useStyles();
  const [data, setData] = useState<BasicTestModel[]>(null);
  const [searchStr, setSearchStr] = useState<string>('');
  const [error, setError] = useState(undefined);
  const openSnackbar = useContext(GlobalSnackbar);

  useEffect(() => {
    Axios.get<BasicTestModel[]>('/api/' + testUrl, {withCredentials: true})
      .then((res) => {
        setData(res.data);
      }, reason => setError(reason.response.data));

    // Reset state
    return () => {
      setData(null);
      setError(undefined);
    }
  }, [testUrl]);

  const getFilterData = () => data.filter(value =>
    // Name searching
    value.name.toLowerCase().includes(searchStr.toLowerCase())
    // Date searching
    || value.createdAt.$date.toString().toLowerCase().includes(searchStr.toLowerCase())
  );

  // When trash button clicked
  const handleDelete = (obj: BasicTestModel) =>
    Axios.delete('/api/' + testUrl, {params: {_id: obj._id.$oid}}).then(() => {
      data.splice(data.indexOf(obj), 1);
      setData([...data]);
      openSnackbar('Delete successfully');
    });

  const handleCopyTest = (newTest: BasicTestModel) =>
    Axios.post<BasicTestModel>('/api/' + testUrl, {...newTest, name: newTest.name + ' copy'}).then(res => {
      data.unshift(res.data);
      setData([...data]);
      openSnackbar('Duplicate successfully');
    }, reason => openSnackbar('Something went wrong: ' + reason.response.data));

  return (
    <Grid container spacing={2}>
      <Grid item container xs={12}>
        <Grid item xs={12} md={6}>
          <SearchInput placeholder="Search tests" onChange={event => setSearchStr(event.target.value)}/>
        </Grid>
        <Grid item xs={12} md={6} style={{display: 'flex', alignItems: 'center', paddingTop: 9}}>
          <span style={{flexGrow: 1}}/>
          <Button color="primary" variant="contained" component={Link} to={`${path}/0`}>
            Add test
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {data ? <Card>
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
                {data.length ? getFilterData().map(test => <TableRow hover key={test._id.$oid}>
                  <TableCell>{test.name}</TableCell>
                  <TableCell>
                    <Tooltip title="Check responses">

                    <Button to={{pathname: `${path}/${test._id.$oid}`, hash: "#responses"}} component={Link}
                            color="primary">{test.responses ? test.responses.length : 0}</Button>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {new Date(test.createdAt?.$date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">

                    <IconButton className={classes.button} size="small" color="primary" component={Link}
                                to={`${path}/${test._id.$oid}`}><Icon>edit</Icon></IconButton>
                    </Tooltip>
                    <ShareIconButton className={classes.button} url={`/task/${testUrl}/${test._id.$oid}`}/>
                    <Tooltip title="Duplicate test">
                      <IconButton className={classes.button} size="small" color="primary"
                                  onClick={() => handleCopyTest(test)}><Icon>content_copy</Icon></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">

                    <IconButton className={classes.button} size="small" color="default"
                                onClick={() => handleDelete(test)}>
                      <Icon>delete</Icon></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>) : <TableRow><TableCell colSpan={4}>
                  There is no test here. You can add test by the button top right.
                </TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card> : <Loading error={!!error} message={error}/>}
      </Grid>

    </Grid>
  )
}

function ShareIconButton({url, ...rest}) {
  const [open, setSnackbarOpen] = useState(false);

  const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    if (reason === 'clickaway') return
    setSnackbarOpen(false);
  };
  const handleShareClick = () => {
    navigator.clipboard.writeText(getCurrentHost() + url)
      .then(() => setSnackbarOpen(true));
  }

  return <>
    <Tooltip title="Copy test URL">
      <IconButton {...rest} size="small" color="primary"
                  onClick={handleShareClick}><Icon>share</Icon></IconButton>
    </Tooltip>
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={open}
      autoHideDuration={10_000}
      onClose={handleClose}
      message="Copy the link to clipboard successfully"
      action={
        <React.Fragment>
          <Button size="small" color="secondary" component={Link} target="_blank"
                  to={url}>View</Button>

          <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
            <Icon fontSize="small">cancel</Icon>
          </IconButton>
        </React.Fragment>
      }
    />
  </>
}
