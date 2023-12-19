import { GraphQLClient } from 'graphql-request'
// import { HYGRAPH_KEY } from '$env/dynamic/private'
import { PUBLIC_HYGRAPH_URL } from '$env/dynamic/public'

export const hygraph = new GraphQLClient(PUBLIC_HYGRAPH_URL, {
  // headers: {
  //   Authorization: `Bearer ${HYGRAPH_KEY}`,
  // },
})
