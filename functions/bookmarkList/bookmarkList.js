const { ApolloServer, gql } = require('apollo-server-lambda')
var faunadb = require('faunadb');
q = faunadb.query
var dotenv = require('dotenv');
dotenv.config()

const typeDefs = gql`
  type Query {
    bookmarks: [Bookmark!]
  }
  type Mutation {
    addBookmark(title: String!, url: String!):Bookmark
    deleteBookmark(id: String!):Bookmark
  }
  type Bookmark {
    id: ID
    title: String
    url: String
  }
`



const resolvers = {
  // Query
  Query: {
    bookmarks: async (root, args, context) => {
      try {
        const client = new faunadb.Client({secret: process.env.ADMIN_SECRET});

        const result = await client.query(
          q.Map(
            q.Paginate(
              q.Documents(q.Collection('posts'))
            ),
            q.Lambda(x => q.Get(x))
          )
        )
       

        return result.data.map((item)=> {
          return{
            id: item.ref.id,
            title: item.data.title,
            url: item.data.url
          }
        })
      }
      catch (error) {
        console.log(error)
      }
    }
  },

  // Mutation
  Mutation: {
    addBookmark: async(_, {title, url})=> {
      try{
        const client = new faunadb.Client({secret: process.env.ADMIN_SECRET});
        const result = await client.query(
          q.Create(
            q.Collection('posts'),
            {data: {
              title: title,
              url: url,
            }}
          )
        )
        

      }
      catch(error){
        console.log(error)
      }
    },
    deleteBookmark: async(_, {id})=> {
      try{
        const client = new faunadb.Client({secret: process.env.ADMIN_SECRET})

        const result = await client.query(
          q.Delete(q.Ref(q.Collection('posts'), id))
        )

        
      }
      catch(error){
        console.log(error)
      }
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

exports.handler = server.createHandler();
