import React from "react";
import { useQuery, useMutation } from '@apollo/client';
import { TextField, Button, Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import gql from 'graphql-tag'
import Loader from '../components/loader'
import styles from './index.module.css'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const GET_BOOKMARKS = gql`
{
    bookmarks {
      id,
      title,
      url,
    }
}
`;

const ADD_BOOKMARKS = gql`
  mutation addBookmark($title: String!, $url: String!){
    addBookmark(title: $title, url: $url){
      id
    }
  }
`;

const DELETE_BOOKMARK = gql`
  mutation deleteBookmark($id: String!){
    deleteBookmark(id: $id){
      id
    }
  }
`;

export default function Home() {
  const classes = useStyles();

  const [addBookmark] = useMutation(ADD_BOOKMARKS)
  const [deleteBookmark] = useMutation(DELETE_BOOKMARK)
  const [input, setInput] = React.useState('')
  const [url, setUrl] = React.useState('')

  const addBkm = async () => {
    addBookmark({
      variables: {
        title: input,
        url: url
      },

      refetchQueries: [{ query: GET_BOOKMARKS }],
    });
    setInput('')
    setUrl('')

  }

  const deleteBkm = async (id) => {
    deleteBookmark({
      variables: {
        id
      },
      refetchQueries: [{ query: GET_BOOKMARKS }],
    })
  }

  const { loading, error, data } = useQuery(GET_BOOKMARKS)


  if (loading) {
    return(
      <div className={styles.loader} >
        <Loader/>
      </div>
    )
  }
  if (error) {
    return <h1>Error...</h1>
  }

  return (
    <div>
      <h1 className={styles.heading} >BOOKMARK APP</h1>
      <div className={styles.Field}  >
        <TextField
          variant="outlined"
          color="primary"
          label="Add Title"
          type="text"

          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />

        <TextField
          variant="outlined"
          color="primary"
          label="Add Url"
          type="text"

          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
        />
      </div>
      <div className={styles.btn} >
        <Button type='submit' color='secondary' variant='outlined' disabled={input.length < 3 || url.length < 3} onClick={() => addBkm()} >Add Bookmark</Button><br />
      </div>
      <Container maxWidth='sm' >
        <div className={classes.root} >
          <Grid container spacing={2} >
            {data.bookmarks.map((data) => {
              return (



                <Grid className={styles.grid} item xs={12} md={6} lg={6} key={data.id} >
                  <Paper id={styles.paper} className={classes.paper} >
                    <p> {data.title}</p>
                    <p>{data.url}</p>
                    <Button color='primary' variant='outlined' onClick={() => deleteBkm(data.id)} >Delete</Button>
                  </Paper>
                </Grid>



              )
            })}
          </Grid>
        </div>
      </Container>
    </div>
  )
}
