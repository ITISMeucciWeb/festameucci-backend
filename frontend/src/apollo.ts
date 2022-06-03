import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'

const httpLink = createHttpLink({
    uri: import.meta.env.VITE_BACKEND_API_URL + 'graphql',
})

// Cache implementation
//TODO: IS REALLY NEEDED?
const cache = new InMemoryCache()

// Create the apollo client
export const apolloClient = new ApolloClient({
    link: httpLink,
    cache,
})
