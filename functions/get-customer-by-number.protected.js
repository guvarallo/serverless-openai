const Airtable = require('airtable')

exports.handler = async function (context, event, callback) {
  const airtableKey = context.AIRTABLE_API_KEY
  const airtableBase = context.AIRTABLE_BASE_ID

  const { customerNumber, profileName } = event

  const base = new Airtable({ apiKey: airtableKey }).base(airtableBase)

  let customer

  try {
    customer = await new Promise((resolve, reject) => {
      let result

      base('Customers')
        .select({
          view: 'Grid view',
          filterByFormula: `{Number} = '${customerNumber}'`,
          maxRecords: 1
        })
        .eachPage(
          function page(records, fetchNextPage) {
            result = records[0]
            fetchNextPage()
          },
          function done(err) {
            if (err) {
              reject(JSON.stringify(err))
            }

            resolve(result)
          }
        )
    })

    if (customer === undefined) {
      await new Promise((resolve, reject) => {
        base('Customers').create(
          [
            {
              fields: {
                Name: profileName,
                Number: customerNumber
              }
            }
          ],
          function (err, records) {
            if (err) {
              console.error(err)
              reject(JSON.stringify(err))
              callback(err)
            }
            records.forEach(function (record) {
              console.log(record.getId())
              resolve(record)
              // return undefined customer so we know it's a new customer
              callback(null, { customer })
            })
          }
        )
      })
    } else {
      callback(null, { customer: customer.fields.Name })
    }
  } catch (error) {
    console.log(error)
    callback(error)
  }
}
