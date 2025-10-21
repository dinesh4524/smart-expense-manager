import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { ChitFund, ChitFundAuction } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Card from './ui/Card';
import { ArrowLeft, PlusCircle, Edit, Trash, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChitDetailsProps {
    chit: ChitFund;
    onBack: () => void;
}

const AuctionForm: React.FC<{ 
    chit: ChitFund; 
    auction?: ChitFundAuction; 
    onSave: (auction: Omit<ChitFundAuction, 'id'> | ChitFundAuction) => Promise<void>; 
    onCancel: () => void; 
    existingMonths: number[];
}> = ({ chit, auction, onSave, onCancel, existingMonths }) => {
    const { settings } = useAppContext(); // Get settings here
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        monthNumber: auction?.monthNumber || (existingMonths.length + 1),
        auctionDate: auction ? auction.auctionDate.split('T')[0] : new Date().toISOString().split('T')[0],
        discountAmount: auction?.discountAmount || 0,
        prizedSubscriberName: auction?.prizedSubscriberName || '',
        isUserPrized: auction?.isUserPrized || false,
    });
    
    const availableMonths = useMemo(() => {
        const allMonths = Array.from({ length: chit.durationMonths }, (_, i) => i + 1);
        return allMonths.filter(m => !existingMonths.includes(m) || m === auction?.monthNumber);
    }, [chit.durationMonths, existingMonths, auction?.monthNumber]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'discountAmount' ? parseFloat(value) : value) 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const discount = parseFloat(String(formData.discountAmount));
        if (isNaN(discount) || discount < 0) {
            toast.error("Discount amount must be a valid number.");
            return;
        }
        
        const maxDiscount = chit.totalAmount * 0.4; // Assuming a legal cap of 40%
        if (discount > maxDiscount) {
            toast.error(`Discount amount exceeds the typical maximum limit (${settings.currency}${maxDiscount.toFixed(2)}).`);
            // Allow saving but warn the user
        }

        setIsSaving(true);
        const auctionData = {
            ...formData,
            chitFundId: chit.id,
            discountAmount: discount,
            monthNumber: parseInt(String(formData.monthNumber)),
            auctionDate: new Date(formData.auctionDate).toISOString(),
        };
        
        try {
            if (auction) {
                await onSave({ ...auction, ...auctionData });
            } else {
                await onSave(auctionData as Omit<ChitFundAuction, 'id'>);
            }
            onCancel();
        } catch (error) {
            console.error("Save failed in form:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Month Number</label>
                    <select name="monthNumber" value={formData.monthNumber} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        {availableMonths.map(m => <option key={m} value={m}>Month {m}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Auction Date</label>
                    <input type="date" name="auctionDate" value={formData.auctionDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">Total Discount/Bid Amount ({settings.currency})</label>
                <input type="number" name="discountAmount" value={formData.discountAmount} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                <p className="text-xs text-gray-500 mt-1">This is the total amount deducted from the Chit Value.</p>
            </div>
            <div>
                <label className="block text-sm font-medium">Prized Subscriber Name</label>
                <input type="text" name="prizedSubscriberName" value={formData.prizedSubscriberName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="isUserPrized" name="isUserPrized" checked={formData.isUserPrized} onChange={handleChange} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"/>
                <label htmlFor="isUserPrized" className="ml-2 block text-sm font-medium">I was the Prized Subscriber this month</label>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Record Auction'}
                </Button>
            </div>
        </form>
    );
};


const ChitDetails: React.FC<ChitDetailsProps> = ({ chit, onBack }) => {
    const { chitFundAuctions, settings, addChitFundAuction, updateChitFundAuction, deleteChitFundAuction } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingAuction, setEditingAuction] = useState<ChitFundAuction | undefined>(undefined);
    const [deletingAuction, setDeletingAuction] = useState<ChitFundAuction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const chitAuctions = useMemo(() => 
        chitFundAuctions.filter(a => a.chitFundId === chit.id).sort((a, b) => a.monthNumber - b.monthNumber),
    [chitFundAuctions, chit.id]);
    
    const totalChitValue = chit.totalAmount; // Gross Chit Amount
    const monthlyInstallment = chit.monthlyInstallment;
    const numMembers = chit.durationMonths;
    const commissionRate = chit.foremanCommissionRate;
    const currency = settings.currency;
    
    const financialSummary = useMemo(() => {
        let totalUserContribution = 0;
        let totalUserDividend = 0;
        let totalUserPrize = 0;
        let totalForemanCommission = 0;
        
        chitAuctions.forEach(auction => {
            const foremanCommission = totalChitValue * commissionRate;
            const dividendPool = auction.discountAmount - foremanCommission;
            const dividendPerMember = dividendPool / numMembers;
            const prizeAmount = totalChitValue - auction.discountAmount;
            
            totalForemanCommission += foremanCommission;
            totalUserDividend += dividendPerMember;
            
            if (auction.isUserPrized) {
                // If user won, they receive the prize amount and still pay the full installment (minus their dividend share)
                // For simplicity in tracking, we calculate the net cash flow:
                // Cash In: Prize Amount + Dividend Share
                // Cash Out: Monthly Installment
                totalUserPrize += prizeAmount;
                totalUserContribution += monthlyInstallment; // User pays full installment
            } else {
                // If user didn't win, their net contribution is reduced by the dividend
                const netContribution = monthlyInstallment - dividendPerMember;
                totalUserContribution += netContribution;
            }
        });
        
        const monthsRemaining = numMembers - chitAuctions.length;
        const userPrized = chitAuctions.some(a => a.isUserPrized);
        
        return {
            totalUserContribution,
            totalUserDividend,
            totalUserPrize,
            totalForemanCommission,
            monthsRemaining,
            userPrized,
        };
    }, [chitAuctions, totalChitValue, commissionRate, numMembers, monthlyInstallment]);

    const openAddModal = () => {
        if (chitAuctions.length >= numMembers) {
            toast.error("All auction months have been recorded.");
            return;
        }
        setEditingAuction(undefined);
        setModalOpen(true);
    };

    const openEditModal = (auction: ChitFundAuction) => {
        setEditingAuction(auction);
        setModalOpen(true);
    };

    const handleSave = async (auctionData: Omit<ChitFundAuction, 'id'> | ChitFundAuction) => {
        if ('id' in auctionData) {
            await updateChitFundAuction(auctionData);
        } else {
            // Check if month number already exists
            if (chitAuctions.some(a => a.monthNumber === auctionData.monthNumber)) {
                toast.error(`Auction for Month ${auctionData.monthNumber} already exists.`);
                return;
            }
            await addChitFundAuction(auctionData);
        }
    };

    const confirmDelete = async () => {
        if (deletingAuction) {
            setIsDeleting(true);
            try {
                await deleteChitFundAuction(deletingAuction.id);
                setDeletingAuction(null);
            } catch (error) {
                console.error("Delete failed:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };
    
    const calculateMonthlyMetrics = (auction: ChitFundAuction) => {
        const foremanCommission = totalChitValue * commissionRate;
        const dividendPool = auction.discountAmount - foremanCommission;
        const dividendPerMember = dividendPool / numMembers;
        const prizeAmount = totalChitValue - auction.discountAmount;
        const netContribution = monthlyInstallment - dividendPerMember;
        
        return {
            foremanCommission,
            dividendPerMember,
            prizeAmount,
            netContribution,
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b dark:border-gray-700 pb-4 mb-4">
                <Button variant="secondary" onClick={onBack}>
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Chit Funds
                </Button>
                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{chit.name} Details</h2>
                <Button onClick={openAddModal} disabled={financialSummary.monthsRemaining === 0}>
                    <PlusCircle size={20} className="mr-2" />
                    Record Auction
                </Button>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Chit Value</p>
                    <p className="text-2xl font-bold">{currency}{totalChitValue.toLocaleString('en-IN')}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Months Completed</p>
                    <p className="text-2xl font-bold">{chitAuctions.length} / {numMembers}</p>
                </Card>
                <Card className={financialSummary.userPrized ? 'bg-green-50 dark:bg-green-900/30' : ''}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">User Status</p>
                    <p className="text-2xl font-bold flex items-center">
                        {financialSummary.userPrized ? <CheckCircle size={24} className="mr-2 text-green-600" /> : <AlertTriangle size={24} className="mr-2 text-yellow-600" />}
                        {financialSummary.userPrized ? 'Prized' : 'Pending'}
                    </p>
                </Card>
            </div>
            
            {/* Financial Overview */}
            <Card>
                <h3 className="text-lg font-semibold mb-4">Financial Overview (User's Perspective)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Total Paid (Net)</p>
                        <p className="font-semibold">{currency}{financialSummary.totalUserContribution.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Total Dividend Earned</p>
                        <p className="font-semibold text-green-600">{currency}{financialSummary.totalUserDividend.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Total Prize Received</p>
                        <p className="font-semibold text-blue-600">{currency}{financialSummary.totalUserPrize.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Total Commission Paid</p>
                        <p className="font-semibold text-red-600">{currency}{financialSummary.totalForemanCommission.toFixed(2)}</p>
                    </div>
                </div>
            </Card>

            {/* Auction History */}
            <Card>
                <h3 className="text-lg font-semibold mb-4">Auction History ({chitAuctions.length} recorded)</h3>
                {chitAuctions.length === 0 ? (
                    <p className="text-gray-500">No auctions recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="p-3">Month</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3 text-right">Discount (Bid)</th>
                                    <th className="p-3 text-right">Prize Amount</th>
                                    <th className="p-3 text-right">User Net Contribution</th>
                                    <th className="p-3">Winner</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chitAuctions.map(auction => {
                                    const metrics = calculateMonthlyMetrics(auction);
                                    return (
                                        <tr key={auction.id} className={`border-b dark:border-gray-700 ${auction.isUserPrized ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                            <td className="p-3 font-medium">{auction.monthNumber}</td>
                                            <td className="p-3">{new Date(auction.auctionDate).toLocaleDateString()}</td>
                                            <td className="p-3 text-right">{currency}{auction.discountAmount.toFixed(2)}</td>
                                            <td className="p-3 text-right font-semibold">{currency}{metrics.prizeAmount.toFixed(2)}</td>
                                            <td className={`p-3 text-right font-semibold ${auction.isUserPrized ? 'text-blue-600' : 'text-green-600'}`}>
                                                {currency}{auction.isUserPrized ? monthlyInstallment.toFixed(2) : metrics.netContribution.toFixed(2)}
                                            </td>
                                            <td className="p-3">
                                                {auction.prizedSubscriberName} 
                                                {auction.isUserPrized && <span className="ml-2 text-xs text-primary-600">(You)</span>}
                                            </td>
                                            <td className="p-3 text-center space-x-2">
                                                <button onClick={() => openEditModal(auction)} className="text-primary-600 hover:text-primary-800"><Edit size={16} /></button>
                                                <button onClick={() => setDeletingAuction(auction)} className="text-red-600 hover:text-red-800"><Trash size={16} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingAuction ? `Edit Auction for Month ${editingAuction.monthNumber}` : 'Record New Auction'}>
                <AuctionForm
                    chit={chit}
                    auction={editingAuction}
                    onSave={handleSave}
                    onCancel={() => setModalOpen(false)}
                    existingMonths={chitAuctions.map(a => a.monthNumber)}
                />
            </Modal>
            
            {deletingAuction && (
                <Modal 
                    isOpen={!!deletingAuction} 
                    onClose={() => setDeletingAuction(null)} 
                    title="Confirm Auction Deletion"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setDeletingAuction(null)} disabled={isDeleting}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </>
                    }
                >
                    <p>Are you sure you want to delete the auction record for Month <strong>{deletingAuction.monthNumber}</strong>? This action cannot be undone.</p>
                </Modal>
            )}
        </div>
    );
};

export default ChitDetails;