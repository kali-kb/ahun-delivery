export const allRestaurants = [
    { 
        name: 'Bella Italia', 
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=60', 
        rating: 4.8, 
        deliveryTime: '25-35 min',
        latitude: 9.0227, // Mock coordinates for Bella Italia
        longitude: 38.7619,
    },
    { 
        name: 'Burger House', 
        image: 'https://images.unsplash.com/photo-1586811333334-3d38345a45a2?auto=format&fit=crop&q=60', 
        rating: 4.2, 
        deliveryTime: '20-30 min',
        latitude: 9.0104, // Mock coordinates for Burger House
        longitude: 38.7636,
    },
    { 
        name: 'Sushi World', 
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=60', 
        rating: 4.9, 
        deliveryTime: '30-40 min',
        latitude: 9.0358, // Mock coordinates for Sushi World
        longitude: 38.7435,
    },
];

export const allMenuItems = [
    { name: 'Margherita Pizza', description: 'Classic cheese and tomato', price: '300 ETB', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=60', restaurant: 'Bella Italia', rating: 4.8, ratingCount: 250, tags: ['pizza', 'vegetarian', 'fasting'] },
    { name: 'Italian Pasta', description: 'Delicious homemade pasta', price: '190 ETB', image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&q=60', restaurant: 'Bella Italia', rating: 4.5, ratingCount: 500, tags: ['pasta', 'fasting'] },
    { name: 'Pepperoni Pizza', description: 'Loaded with pepperoni', price: '350 ETB', image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=60', restaurant: 'Bella Italia', rating: 4.5, ratingCount: 510, tags: ['pizza'] },
    { name: 'Classic Burger', description: 'Juicy beef patty', price: '250 ETB', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=60', restaurant: 'Burger House', rating: 4.2, ratingCount: 320, tags: ['burger'] },
    { name: 'Sushi Platter', description: 'A selection of fresh sushi.', price: '550 ETB', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=60', restaurant: 'Sushi World', rating: 4.9, ratingCount: 600, tags: ['sushi', 'fasting'] },
];