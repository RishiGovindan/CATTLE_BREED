import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  listingsApi,
} from '../services/api'


export default function EditListing() {

  const {
    listingId,
  } = useParams()


  const navigate =
    useNavigate()


  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    saving,
    setSaving,
  ] = useState(false)


  const [
    error,
    setError,
  ] = useState('')


  const [
    success,
    setSuccess,
  ] = useState('')


  const [
    form,
    setForm,
  ] = useState({

    title: '',

    animal_type: '',

    breed: '',

    breed_id: '',

    gender: '',

    age: '',

    location: '',

    price: '',

    description: '',

    health_status: '',

    vaccination_status: '',

    image: '',

  })


  /*
  =========================================================
  LOAD LISTING
  =========================================================
  */

  useEffect(
    () => {

      loadListing()

    },
    [listingId],
  )


  async function loadListing() {

    setLoading(true)

    setError('')


    try {

      const listing =
        await listingsApi.byId(
          listingId,
        )


      setForm({

        title:
          listing.title || '',


        animal_type:
          listing.animalType || '',


        breed:
          listing.breed || '',


        breed_id:
          listing.breedId || '',


        gender:
          listing.gender || '',


        age:
          listing.age ?? '',


        location:
          listing.location || '',


        price:
          listing.price ?? '',


        description:
          listing.description || '',


        health_status:
          listing.healthStatus ===
          'Not specified.'
            ? ''
            : listing.healthStatus || '',


        vaccination_status:
          listing.vaccinationStatus ===
          'Not specified.'
            ? ''
            : listing.vaccinationStatus || '',


        image:
          listing.images &&
          listing.images.length > 0
            ? listing.images[0]
            : '',

      })

    } catch (error) {

      setError(
        error.message ||
          'Could not load this listing.',
      )

    } finally {

      setLoading(false)

    }
  }


  /*
  =========================================================
  HANDLE INPUT CHANGE
  =========================================================
  */

  function handleChange(
    event,
  ) {

    const {
      name,
      value,
    } = event.target


    setForm(
      (current) => ({

        ...current,

        [name]:
          value,

      }),
    )
  }


  /*
  =========================================================
  SAVE CHANGES
  =========================================================
  */

  async function handleSubmit(
    event,
  ) {

    event.preventDefault()


    setSaving(true)

    setError('')

    setSuccess('')


    try {

      const payload = {

        title:
          form.title.trim(),


        animal_type:
          form.animal_type,


        breed:
          form.breed.trim(),


        breed_id:
          form.breed_id.trim() ||
          null,


        gender:
          form.gender,


        age:
          String(
            form.age,
          ),


        location:
          form.location.trim(),


        price:
          Number(
            form.price,
          ),


        description:
          form.description.trim(),


        health_status:
          form.health_status.trim() ||
          null,


        vaccination_status:
          form.vaccination_status.trim() ||
          null,


        image:
          form.image.trim() ||
          null,

      }


      await listingsApi.update(
        listingId,
        payload,
      )


      setSuccess(
        'Your listing has been updated successfully.',
      )


      setTimeout(
        () => {

          navigate(
            '/my-listings',
          )

        },
        1200,
      )

    } catch (error) {

      setError(
        error.message ||
          'Could not update the listing.',
      )

    } finally {

      setSaving(false)

    }
  }


  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {

    return (

      <section className="marketplace-page">

        <div className="marketplace-inner">

          <div className="breed-explorer-intro">

            <span className="eyebrow">

              Seller Dashboard

            </span>


            <h1 className="breed-explorer-title">

              Edit Listing

            </h1>


            <p className="breed-explorer-subtitle">

              Loading your listing…

            </p>

          </div>

        </div>

      </section>
    )
  }


  /*
  =========================================================
  LOAD ERROR
  =========================================================
  */

  if (
    error &&
    !form.breed
  ) {

    return (

      <section className="marketplace-page">

        <div className="marketplace-inner">

          <div className="breed-explorer-intro">

            <span className="eyebrow">

              Seller Dashboard

            </span>


            <h1 className="breed-explorer-title">

              Edit Listing

            </h1>

          </div>


          <div
            className="create-listing-success"
            style={{
              marginTop:
                '32px',
            }}
          >

            <span
              className="contact-modal-success-icon"
              aria-hidden="true"
            >
              !
            </span>


            <h2>

              Could Not Load Listing

            </h2>


            <p>

              {error}

            </p>


            <div
              className="create-listing-success-actions"
            >

              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  loadListing
                }
              >

                Try Again

              </button>


              <Link
                to="/my-listings"
                className="btn btn-secondary"
              >

                Back to My Listings

              </Link>

            </div>

          </div>

        </div>

      </section>
    )
  }


  /*
  =========================================================
  MAIN PAGE
  =========================================================
  */

  return (

    <section className="marketplace-page">

      <div className="marketplace-inner">


        <div className="breed-explorer-intro">

          <span className="eyebrow">

            Seller Dashboard

          </span>


          <h1 className="breed-explorer-title">

            Edit Listing

          </h1>


          <p className="breed-explorer-subtitle">

            Update your livestock listing details.

          </p>

        </div>


        {success && (

          <div
            className="create-listing-success"
            style={{
              marginTop:
                '32px',
            }}
          >

            <h2>

              Listing Updated

            </h2>


            <p>

              {success}

            </p>

          </div>

        )}


        {error && (

          <div
            className="create-listing-success"
            style={{
              marginTop:
                '32px',
            }}
          >

            <h2>

              Something Went Wrong

            </h2>


            <p>

              {error}

            </p>

          </div>

        )}


        <form
          onSubmit={
            handleSubmit
          }
          style={{
            marginTop:
              '40px',

            maxWidth:
              '800px',

          }}
        >


          <div
            style={{
              marginBottom:
                '20px',
            }}
          >

            <label>

              Listing Title

            </label>


            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />

          </div>


          <div
            style={{
              marginBottom:
                '20px',
            }}
          >

            <label>

              Animal Type

            </label>


            <select
              name="animal_type"
              value={form.animal_type}
              onChange={handleChange}
              required
            >

              <option value="">

                Select animal type

              </option>


              <option value="Cattle">

                Cattle

              </option>


              <option value="Buffalo">

                Buffalo

              </option>


              <option value="Goat">

                Goat

              </option>


              <option value="Sheep">

                Sheep

              </option>

            </select>

          </div>


          <div
            style={{
              marginBottom:
                '20px',
            }}
          >

            <label>

              Breed

            </label>


            <input
              type="text"
              name="breed"
              value={form.breed}
              onChange={handleChange}
              required
            />

          </div>


          <div
            style={{
              marginBottom:
                '20px',
            }}
          >

            <label>

              Gender

            </label>


            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >

              <option value="">

                Select gender

              </option>


              <option value="Male">

                Male

              </option>


              <option value="Female">

                Female

              </option>

            </select>

          </div>


          <div
            style={{
              marginBottom:
                '20px',
            }}
          >

            <label>

              Age

            </label>


            <input
              type="text"
              name="age"
              value={form.age}
              onChange={handleChange}
              required
            />

          </div>


          <div
            style={{
              marginBottom:
                '20px',
            }}
          >

            <label>

              Location

            </label>


            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />

          </div>


          <div
            style={{
              marginBottom:
                '20px',
            }}
          >

            <label>

              Price

            </label>


            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              required
            />

          </div>


          <div
            style={{
              marginBottom:
                '20px',
            }}
          >

            <label>

              Description

            </label>


            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="6"
              required
            />

          </div>


          <div
            style={{
              marginBottom:
                '20px',
            }}
          >

            <label>

              Health Status

            </label>


            <input
              type="text"
              name="health_status"
              value={form.health_status}
              onChange={handleChange}
            />

          </div>


          <div
            style={{
              marginBottom:
                '20px',
            }}
          >

            <label>

              Vaccination Status

            </label>


            <input
              type="text"
              name="vaccination_status"
              value={form.vaccination_status}
              onChange={handleChange}
            />

          </div>


          <div
            style={{
              marginBottom:
                '30px',
            }}
          >

            <label>

              Image URL

            </label>


            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
            />

          </div>


          <div
            className="create-listing-success-actions"
          >

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >

              {saving
                ? 'Saving Changes…'
                : 'Save Changes'}

            </button>


            <Link
              to="/my-listings"
              className="btn btn-secondary"
            >

              Cancel

            </Link>

          </div>

        </form>

      </div>

    </section>
  )
}