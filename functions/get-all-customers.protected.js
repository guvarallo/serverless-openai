const Airtable = require('airtable')

exports.handler = async function (context, event, callback) {
  const airtableKey = context.AIRTABLE_API_KEY
  const airtableBase = context.AIRTABLE_BASE_ID

  const base = new Airtable({ apiKey: airtableKey }).base(airtableBase)

  try {
    const customers = await new Promise((resolve, reject) => {
      let results

      base('Customers')
        .select({
          view: 'Grid view',
          pageSize: 100
        })
        .eachPage(
          function page(records, fetchNextPage) {
            results.forEach(function (record) {
              customers.push(record)
            })
            fetchNextPage()
          },
          function done(err) {
            if (err) {
              reject(JSON.stringify(err))
            }

            resolve(results)
          }
        )
    })

    callback(null, { results })
  } catch (error) {
    console.log(error)
    callback(err)
  }
}
