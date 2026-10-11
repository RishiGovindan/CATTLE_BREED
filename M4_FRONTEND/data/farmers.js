export const FARMERS = [
  {
    id: 'green-valley-farms',
    name: 'Raj Patel',
    farmName: 'Green Valley Farms',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gir_01.JPG?width=800',
    location: 'Junagadh, Gujarat',
    bio: 'Focused on responsible breeding and healthy indigenous cattle. Three generations of raising Gir cattle in the heart of Gir\u2019s native tract.',
    experience: 12,
    verified: true,
  },
  {
    id: 'sahiwal-heritage-dairy',
    name: 'Manpreet Singh',
    farmName: 'Sahiwal Heritage Dairy',
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Sahiwal-_breed_cow_at_the_dairy_unit_attached_to_Bhai_Ram_Singh_Memorial_(Gurudwara)_,_Bhaini_Sahib_,Ludhyana,_Punjab_,India.JPG?width=800',
    location: 'Ludhiana, Punjab',
    bio: 'A family dairy operation preserving Punjab\u2019s Sahiwal and Nili-Ravi bloodlines, with an emphasis on tick resistance and consistent milk yield.',
    experience: 18,
    verified: true,
  },
  {
    id: 'nandini-holstein-farms',
    name: 'Suresh Kumar',
    farmName: 'Nandini Holstein Farms',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Holstein_cow.jpg?width=800',
    location: 'Belagavi, Karnataka',
    bio: 'A growing dairy farm specializing in high-yield Holstein Friesian and Jersey cattle for commercial milk production.',
    experience: 5,
    verified: false,
  },
  {
    id: 'deccan-beef-ranch',
    name: 'Vikram Deshmukh',
    farmName: 'Deccan Beef Ranch',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_angus_cattle.jpg?width=800',
    location: 'Nashik, Maharashtra',
    bio: 'A pasture-based beef breeding operation raising Angus and Brahman cattle for temperament, growth rate, and heat tolerance.',
    experience: 9,
    verified: true,
  },
  {
    id: 'charotar-buffalo-coop',
    name: 'Kiran Patel',
    farmName: 'Charotar Buffalo Co-operative',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/A_close-up_of_Buffalo.JPG?width=800',
    location: 'Anand, Gujarat',
    bio: 'A farmer co-operative in the Charotar belt breeding Surti and Mehsana buffalo, known for consistently high milk fat content.',
    experience: 22,
    verified: true,
  },
  {
    id: 'sunrise-livestock-traders',
    name: 'Muthu Selvam',
    farmName: 'Sunrise Livestock Traders',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%BAfalo_Murrah.JPG?width=800',
    location: 'Erode, Tamil Nadu',
    bio: 'A livestock trading yard connecting buffalo breeders across Tamil Nadu with dairy farmers looking for proven, healthy animals.',
    experience: 3,
    verified: false,
  },
]

export function getFarmerById(id) {
  return FARMERS.find((farmer) => farmer.id === id)
}
