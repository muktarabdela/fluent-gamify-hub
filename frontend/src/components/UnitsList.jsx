import React, { useEffect, useState } from 'react';
import UnitProgress from './UnitProgress';
import { getAllUnits } from '@/api/unitService';

export default function UnitsList({ visibleUnitId }) {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const unitsData = await getAllUnits();
                setUnits(Array.isArray(unitsData) ? unitsData : []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching units:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUnits();
    }, []);

    if (loading) return <div className="flex justify-center items-center p-4">
        <span className="text-gray-600">Loading units...</span>
    </div>;

    if (error) return <div className="text-red-500 p-4 text-center">
        <p>Error: {error}</p>
    </div>;

    // Show the first unit by default if no unit is visible yet
    const visibleUnit = units.find(unit => unit.unit_id === visibleUnitId) || units[0];
    
    return (
        <div className="fixed top-16 left-0 right-0 z-50">
            {visibleUnit && (
                <UnitProgress
                    unit={visibleUnit}
                    isFixed={true}
                    isVisible={true}
                />
            )}
        </div>
    );
}