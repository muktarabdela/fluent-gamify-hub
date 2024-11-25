import React, { useEffect, useState } from 'react';
import UnitProgress from './UnitProgress';
import { getAllUnits } from '@/api/unitService';

export default function UnitsList({ onUnitSelect, selectedUnitId }) {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const unitsData = await getAllUnits();
                // console.log('📦 Units data:', unitsData);
                setUnits(Array.isArray(unitsData) ? unitsData : []);
                
                // Select the first unit by default if none is selected
                if (!selectedUnitId && unitsData.length > 0) {
                    onUnitSelect(unitsData[0].unit_id);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('🔴 Error fetching units:', err);
                setError(err.message || 'Failed to fetch units');
                setLoading(false);
            }
        };

        fetchUnits();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center p-4">
            <span className="text-gray-600">Loading units...</span>
        </div>
    );

    if (error) return (
        <div className="text-red-500 p-4 text-center">
            <p>Error: {error}</p>
            <p className="text-sm text-gray-600 mt-2">
                Please make sure your backend server is running on port 5000
            </p>
        </div>
    );

    if (!units.length) return (
        <div className="text-gray-500 p-4 text-center">
            No units found
        </div>
    );

    return (
        <div className="space-y-4">
            {units.map((unit) => (
                <div 
                    key={unit.unit_id} 
                    onClick={() => onUnitSelect(unit.unit_id)}
                    className="cursor-pointer"
                >
                    <UnitProgress
                        unit={unit}
                        isFixed={true}
                        isSelected={selectedUnitId === unit.unit_id}
                    />
                </div>
            ))}
        </div>
    );
}