import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { profilesApi, listingsApi } from '../services/api'
import ListingCard from '../components/ListingCard'
import VerifiedBadge from '../components/VerifiedBadge'
import EmptyState from '../components/EmptyState'

export default function FarmerProfile() {
  const { farmerId }=useParams(); const navigate=useNavigate()
  const [farmer,setFarmer]=useState(null); const [listings,setListings]=useState([]); const [loading,setLoading]=useState(true)
  useEffect(()=>{ Promise.all([profilesApi.public(farmerId), listingsApi.bySeller(farmerId)]).then(([p,l])=>{setFarmer(p);setListings(l)}).catch(()=>setFarmer(null)).finally(()=>setLoading(false)) },[farmerId])
  if(loading) return <section className="breed-details-page"><div className="breed-details-inner"><p>Loading seller…</p></div></section>
  if(!farmer) return <section className="breed-details-page"><div className="breed-details-inner"><EmptyState icon="?" title="Farmer not found" message="We couldn't find this seller profile." actionLabel="Back to TradeHub" actionHref="/marketplace"/></div></section>
  return <section className="breed-details-page farmer-profile-page"><div className="breed-details-inner">
    <button type="button" className="breed-details-back" onClick={()=>navigate(-1)}><span aria-hidden="true">&larr;</span> Back</button>
    <div className="farmer-profile-hero">{farmer.image && <img src={farmer.image} alt={farmer.farmName} className="farmer-profile-image"/>}
      <div className="farmer-profile-heading">{farmer.verified&&<VerifiedBadge/>}<h1 className="breed-details-name">{farmer.farmName}</h1><p className="breed-details-origin">{farmer.location}</p>
      <ul className="listing-details-facts farmer-profile-facts"><li><span>Listings</span>{listings.length}</li><li><span>Status</span>{farmer.verified?'Verified Seller':'Seller'}</li></ul></div></div>
    <div className="listing-details-section"><h2 className="breed-details-section-title">Available Livestock</h2>{listings.length?<div className="listing-grid">{listings.map(l=><ListingCard key={l.id} listing={l}/>)}</div>:<div className="breed-explorer-empty"><EmptyState icon="◊" title="No active listings" message={`${farmer.farmName} doesn't have any livestock listed right now.`}/></div>}</div>
    <div className="breed-details-footer-nav"><Link to="/marketplace" className="btn btn-secondary">&larr; Back to TradeHub</Link></div>
  </div></section>
}